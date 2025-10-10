import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, catchError, tap, delay, map } from 'rxjs';
import { User, UserRole, UserPermissions, UserValidator, PermissionManager } from '../../models/user/user.model';
import { AuthState, LoginCredentials, RegisterData, SocialUser, ChangePasswordData, AuthHelper } from '../../models/user/user-auth.model';
import { NotificationService } from '../shared/notification.service';
import { environment } from 'src/environments/environment';

declare var google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 🔐 CONFIGURAÇÕES DE STORAGE
  private readonly STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
    REMEMBER_ME: 'remember_me',
    PERMISSIONS: 'user_permissions',
    REFRESH_TOKEN: 'refresh_token',
    TOKEN_EXPIRY: 'token_expiry'
  } as const;

  // 🎯 ESTADO DA AUTENTICAÇÃO
  private authState = new BehaviorSubject<AuthState>(AuthHelper.createInitialAuthState());
  public authState$: Observable<AuthState> = this.authState.asObservable();

  // 🔑 GOOGLE AUTH
  private isGoogleInitialized = false;
  private googleScriptLoaded = false;
  private currentSocialUser = new BehaviorSubject<SocialUser | null>(null);

  constructor(
    private notificationService: NotificationService
  ) {
    this.initializeAuthState();
    this.initializeGoogleAuth().subscribe();
  }

  // ========== INICIALIZAÇÃO ==========

  /**
   * Inicializa o estado da autenticação a partir do localStorage
   */
  private initializeAuthState(): void {
    const savedUser = this.getFromStorage<User>(this.STORAGE_KEYS.USER);
    const token = this.getFromStorage<string>(this.STORAGE_KEYS.TOKEN);
    const savedPermissions = this.getFromStorage<UserPermissions>(this.STORAGE_KEYS.PERMISSIONS);

    if (savedUser && token) {
      const permissions = savedPermissions || PermissionManager.getPermissionsByRole(savedUser.role);

      this.updateAuthState({
        user: savedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: permissions
      });
    }
  }

  /**
   * Inicializa o Google Auth
   */
  private initializeGoogleAuth(): Observable<void> {
    return new Observable(observer => {
      if (this.isGoogleInitialized) {
        observer.next();
        observer.complete();
        return;
      }

      this.loadGoogleScript().subscribe({
        next: () => this.setupGoogleAuth(observer),
        error: (error) => observer.error(error)
      });
    });
  }

  private loadGoogleScript(): Observable<void> {
    return new Observable(observer => {
      if (this.googleScriptLoaded) {
        observer.next();
        observer.complete();
        return;
      }

      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        this.googleScriptLoaded = true;
        observer.next();
        observer.complete();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.googleScriptLoaded = true;
        observer.next();
        observer.complete();
      };

      script.onerror = (error) => observer.error(error);
      document.head.appendChild(script);
    });
  }

  private setupGoogleAuth(observer: any): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: false
      });

      this.isGoogleInitialized = true;
      observer.next();
      observer.complete();
    } catch (error) {
      observer.error(error);
    }
  }

  // ========== AUTENTICAÇÃO TRADICIONAL ==========

  /**
   * Login com email e senha
   */
  login(credentials: LoginCredentials): Observable<boolean> {
    this.updateAuthState({ isLoading: true, error: null });

    return of(this.validateLoginCredentials(credentials)).pipe(
      delay(1500),
      tap(success => {
        success
          ? this.handleSuccessfulLogin(credentials.rememberMe ?? false, this.determineUserRole(credentials.email))
          : this.handleFailedLogin('Email ou senha inválidos');
      }),
      catchError(error => this.handleAuthError('Erro no login'))
    );
  }

  /**
   * Registro de novo usuário
   */
  register(userData: RegisterData): Observable<boolean> {
    this.updateAuthState({ isLoading: true, error: null });

    if (!AuthHelper.passwordsMatch(userData.password, userData.confirmPassword)) {
      this.handleFailedLogin('Senhas não coincidem');
      return of(false);
    }

    return of(true).pipe(
      delay(1500),
      tap(() => {
        const newUser = this.createUserFromRegistration(userData);
        const permissions = PermissionManager.getPermissionsByRole(UserRole.CUSTOMER);

        this.saveUserToStorage(newUser, permissions, userData.rememberMe ?? false);
        this.updateAuthState({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          permissions: permissions
        });

        this.notificationService.showSuccess('Cadastro realizado com sucesso!');
      }),
      catchError(error => this.handleAuthError('Erro no cadastro'))
    );
  }

  /**
   * Logout do usuário
   */
  logout(): void {
    this.clearAuthStorage();
    this.updateAuthState(AuthHelper.createInitialAuthState());
    this.signOutGoogle();
    this.notificationService.showInfo('Logout realizado com sucesso');
  }

  // ========== AUTENTICAÇÃO SOCIAL ==========

  /**
   * Login com Google
   */
  loginWithGoogle(): Observable<SocialUser> {
    return new Observable(observer => {
      if (!this.isGoogleInitialized) {
        observer.error('Google Auth não inicializado');
        return;
      }

      this.renderVisibleGoogleButton(observer);
    });
  }

  /**
   * Login com qualquer provedor social
   */
  loginWithSocial(provider: 'google'): Observable<boolean> {
    return this.loginWithGoogle().pipe(
      map(socialUser => {
        const user = this.mapSocialUserToUser(socialUser);
        const permissions = PermissionManager.getPermissionsByRole(UserRole.CUSTOMER);

        this.saveSocialUserToStorage(user, permissions, socialUser);
        this.updateAuthState({
          user: user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          permissions: permissions
        });

        this.notificationService.showSuccess(`Login com ${provider} realizado com sucesso!`);
        return true;
      }),
      catchError(error => this.handleAuthError(`Erro no login com ${provider}`))
    );
  }

  /**
   * Renderiza botão Google visível para o usuário
   */
  private renderVisibleGoogleButton(observer: any): void {
    let subscription: any;

    try {
      const existingContainer = document.getElementById('google-signin-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      // Cria container visível
      const container = document.createElement('div');
      container.id = 'google-signin-container';
      container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1px solid #ddd;
    `;

      // Adiciona título
      const title = document.createElement('h3');
      title.textContent = 'Entrar com Google';
      title.style.cssText = `
      margin: 0 0 15px 0;
      text-align: center;
      color: #333;
      font-size: 16px;
    `;
      container.appendChild(title);

      // Botão de fechar
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
    `;
      closeButton.onclick = () => {
        cleanup();
        observer.error('Login cancelado pelo usuário');
      };
      container.appendChild(closeButton);

      // Container para o botão Google
      const buttonContainer = document.createElement('div');
      buttonContainer.id = 'google-button-wrapper';
      container.appendChild(buttonContainer);

      document.body.appendChild(container);

      // Renderiza botão Google
      google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 240
      });

      // Adiciona overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
    `;
      overlay.onclick = () => {
        cleanup();
        observer.error('Login cancelado pelo usuário');
      };
      document.body.appendChild(overlay);

      const timeout = setTimeout(() => {
        cleanup();
        observer.error('Tempo limite excedido');
      }, 120000);

      const cleanup = () => {
        clearTimeout(timeout);
        if (subscription) {
          subscription.unsubscribe();
        }
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      };

      subscription = this.currentSocialUser.subscribe(user => {
        if (user) {
          cleanup();
          observer.next(user);
          observer.complete();
        }
      });

    } catch (error) {
      console.error('❌ Erro ao renderizar botão Google:', error);
      observer.error('Erro ao carregar autenticação Google');
    }
  }

  private waitForSocialAuth(observer: any, maxAttempts: number): void {
    let attempts = 0;

    const checkAuth = () => {
      attempts++;
      const currentUser = this.currentSocialUser.value;

      if (currentUser) {
        console.log('✅ Usuário Google autenticado:', currentUser.name);
        observer.next(currentUser);
        observer.complete();
      } else if (attempts >= maxAttempts) {
        console.warn(`❌ Timeout após ${maxAttempts} tentativas`);
        observer.error('Tempo limite excedido. Tente novamente.');
      } else {
        setTimeout(checkAuth, 100);
      }
    };

    checkAuth();
  }

  private handleGoogleCredentialResponse(response: any): void {
    if (response.credential) {
      try {
        const payload = this.decodeJWT(response.credential);
        const socialUser = this.mapToSocialUser(payload, response.credential);
        this.currentSocialUser.next(socialUser);
      } catch (error) {
        console.error('Erro ao processar resposta do Google:', error);
      }
    }
  }

  // ========== GERENCIAMENTO DE TOKENS ==========

  refreshToken(): Observable<string | null> {
    const refreshToken = this.getFromStorage<string>(this.STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      return of(null);
    }

    return of(`refreshed-token-${Date.now()}`).pipe(
      delay(1000),
      tap(newToken => {
        if (newToken) {
          this.saveToStorage(this.STORAGE_KEYS.TOKEN, newToken);
          this.saveToStorage(this.STORAGE_KEYS.TOKEN_EXPIRY, new Date(Date.now() + 60 * 60 * 1000).toISOString());
        }
      }),
      catchError(error => {
        this.logout();
        return of(null);
      })
    );
  }

  isTokenExpired(): boolean {
    const expiry = this.getFromStorage<string>(this.STORAGE_KEYS.TOKEN_EXPIRY);
    return !expiry || new Date() > new Date(expiry);
  }

  // ========== MÉTODOS DE VERIFICAÇÃO ==========

  getCurrentUser(): User | null {
    return this.authState.value.user;
  }

  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  getToken(): string | null {
    const token = this.getFromStorage<string>(this.STORAGE_KEYS.TOKEN);

    // Verifica se o token existe e não está expirado
    if (!token || this.isTokenExpired()) {
      return null;
    }

    return token;
  }

  hasPermission(permission: keyof UserPermissions): boolean {
    return PermissionManager.canAccess(this.authState.value.permissions, permission);
  }

  hasAnyPermission(permissions: (keyof UserPermissions)[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: (keyof UserPermissions)[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  isAdmin(): boolean {
    return this.authState.value.user?.role === UserRole.ADMIN;
  }

  getCurrentPermissions(): UserPermissions {
    return this.authState.value.permissions;
  }

  // ========== MÉTODOS DE ATUALIZAÇÃO ==========

  updateUserProfile(updatedUser: User): void {
    const currentState = this.authState.value;
    this.updateAuthState({ user: { ...currentState.user, ...updatedUser } });
    this.saveToStorage(this.STORAGE_KEYS.USER, updatedUser);
  }

  updateUserPermissions(role: UserRole): void {
    const permissions = PermissionManager.getPermissionsByRole(role);

    this.updateAuthState({ permissions: permissions });
    this.saveToStorage(this.STORAGE_KEYS.PERMISSIONS, permissions);
  }

  // ========== MÉTODOS PRIVADOS ==========

  private updateAuthState(newState: Partial<AuthState>): void {
    this.authState.next({ ...this.authState.value, ...newState });
  }

  private validateLoginCredentials(credentials: LoginCredentials): boolean {
    return UserValidator.isValidEmail(credentials.email) &&
      AuthHelper.isValidPassword(credentials.password);
  }

  private determineUserRole(email: string): UserRole {
    return email.includes('admin') ? UserRole.ADMIN : UserRole.CUSTOMER;
  }

  private handleSuccessfulLogin(rememberMe: boolean, role: UserRole): void {
    const mockUser = this.createMockUser(role);
    const permissions = PermissionManager.getPermissionsByRole(role);

    if (rememberMe) {
      this.saveUserToStorage(mockUser, permissions, rememberMe);
    }

    this.updateAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      permissions: permissions
    });

    this.notificationService.showSuccess('Login realizado com sucesso!');
  }

  private handleFailedLogin(errorMessage: string): void {
    this.updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: errorMessage,
      permissions: PermissionManager.getPermissionsByRole(UserRole.CUSTOMER)
    });
    this.notificationService.showError(errorMessage);
  }

  private handleAuthError(errorMessage: string): Observable<boolean> {
    this.notificationService.showError(errorMessage);
    this.updateAuthState({ isLoading: false, error: errorMessage });
    return of(false);
  }

  // ========== GERENCIAMENTO DE STORAGE ==========

  private saveUserToStorage(user: User, permissions: UserPermissions, rememberMe: boolean): void {
    if (rememberMe) {
      this.saveToStorage(this.STORAGE_KEYS.USER, user);
      this.saveToStorage(this.STORAGE_KEYS.PERMISSIONS, permissions);
      this.saveToStorage(this.STORAGE_KEYS.REMEMBER_ME, 'true');

      // Também salva token mock para login tradicional
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockRefreshToken = 'mock-refresh-token-' + Date.now();
      const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      this.saveToStorage(this.STORAGE_KEYS.TOKEN, mockToken);
      this.saveToStorage(this.STORAGE_KEYS.REFRESH_TOKEN, mockRefreshToken);
      this.saveToStorage(this.STORAGE_KEYS.TOKEN_EXPIRY, expiry);
    } else {
      // ✅ LIMPA O STORAGE SE NÃO FOR LEMBRAR
      this.clearAuthStorage();

      // Mas mantém o usuário na sessão atual
      this.saveToStorage(this.STORAGE_KEYS.USER, user);
      this.saveToStorage(this.STORAGE_KEYS.PERMISSIONS, permissions);
    }
  }

  private saveSocialUserToStorage(user: User, permissions: UserPermissions, socialUser: SocialUser): void {
    const mockToken = `social-${socialUser.provider}-token-${Date.now()}`;
    const mockRefreshToken = `social-refresh-${socialUser.provider}-token-${Date.now()}`;
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    this.saveToStorage(this.STORAGE_KEYS.TOKEN, mockToken);
    this.saveToStorage(this.STORAGE_KEYS.REFRESH_TOKEN, mockRefreshToken);
    this.saveToStorage(this.STORAGE_KEYS.TOKEN_EXPIRY, expiry);
    this.saveToStorage(this.STORAGE_KEYS.USER, user);
    this.saveToStorage(this.STORAGE_KEYS.PERMISSIONS, permissions);
  }

  private clearAuthStorage(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  private getFromStorage<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private saveToStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ========== MAPEAMENTO DE USUÁRIOS ==========

  private createMockUser(role: UserRole = UserRole.CUSTOMER): User {
    return {
      id: '1',
      name: role === UserRole.ADMIN ? 'Admin User' : 'Rafael Silva',
      email: role === UserRole.ADMIN ? 'admin@minhaprata.com' : 'rafael@minhaprata.com',
      cpf: '123.456.789-00',
      phone_number: '(11) 99999-9999',
      dt_birth: '1990-01-01',
      role: role,
      avatar: 'https://via.placeholder.com/150'
    };
  }

  private createUserFromRegistration(userData: RegisterData): User {
    return {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      cpf: userData.cpf,
      phone_number: userData.phone_number,
      dt_birth: userData.dt_birth,
      role: UserRole.CUSTOMER
    };
  }

  private mapSocialUserToUser(socialUser: SocialUser): User {
    return {
      id: socialUser.id,
      name: socialUser.name,
      email: socialUser.email,
      cpf: '', // Preencher depois no perfil
      phone_number: '', // Preencher depois
      dt_birth: '', // Preencher depois
      role: UserRole.CUSTOMER,
      avatar: socialUser.photoUrl
    };
  }

  private mapToSocialUser(profile: any, idToken: string): SocialUser {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      photoUrl: profile.picture,
      firstName: profile.given_name,
      lastName: profile.family_name,
      provider: 'google',
      idToken: idToken
    };
  }

  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar JWT:', error);
      throw error;
    }
  }

  private signOutGoogle(): void {
    this.currentSocialUser.next(null);

    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.cancel();
      google.accounts.id.disableAutoSelect();
    }

    // Limpa cookies do Google
    document.cookie = 'g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }

  // ========== 🧪 MÉTODOS PARA TESTES ==========

  /**
   * Simula mudança de role (apenas para testes/demo)
   */
  simulateRoleChange(newRole: UserRole): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      this.saveToStorage(this.STORAGE_KEYS.USER, updatedUser);
      this.updateUserPermissions(newRole);
      this.updateAuthState({ user: updatedUser });
      this.notificationService.showInfo(`Função alterada para: ${newRole}`);
    }
  }
}