import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, delay, Observable, of, tap } from 'rxjs';
import { AuthState, LoginCredentials, PermissionManager, RegisterData, User, UserRole, UserPermissions } from '../models/user';
import { SocialUser } from '../models/social-user';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authStateSubject: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    permissions: PermissionManager.getPermissionsByRole(UserRole.CUSTOMER)
  };

  private authState = new BehaviorSubject<AuthState>(this.authStateSubject);
  public authState$: Observable<AuthState> = this.authState.asObservable();
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly REMEMBER_ME_KEY = 'remember_me';
  private readonly PERMISSIONS_KEY = 'user_permissions';

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

  constructor(
    private notificationService: NotificationService
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const savedUser = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    const savedPermissions = localStorage.getItem(this.PERMISSIONS_KEY);

    if (savedUser && token) {
      const user = JSON.parse(savedUser);
      const permissions = savedPermissions
        ? JSON.parse(savedPermissions)
        : PermissionManager.getPermissionsByRole(user.role);

      this.updateAuthState({
        user: user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: permissions
      });
    }
  }

  private updateAuthState(newState: Partial<AuthState>): void {
    this.authState.next({
      ...this.authState.value,
      ...newState
    });
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    this.updateAuthState({ isLoading: true, error: null });

    return of(this.mockLoginValidation(credentials)).pipe(
      delay(1500),
      tap(success => {
        if (success) {
          // Determina a role baseada no email (para demonstração)
          const role = credentials.email.includes('admin') ? UserRole.ADMIN : UserRole.CUSTOMER;
          this.handleLoginSuccess(credentials.rememberMe, role);
        } else {
          this.handleLoginFailure();
        }
      })
    );
  }

  private mockLoginValidation(credentials: LoginCredentials): boolean {
    return !!(credentials.email && credentials.password);
  }

  private handleLoginFailure(): void {
    this.updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Email ou senha inválidos',
      permissions: PermissionManager.getPermissionsByRole(UserRole.CUSTOMER)
    });

    this.notificationService.showError('Email ou senha inválidos');
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    localStorage.removeItem(this.PERMISSIONS_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

    this.updateAuthState(this.authStateSubject);

    this.notificationService.showInfo('Logout realizado com sucesso');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.authState.value.user;
  }

  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  register(userData: RegisterData): Observable<boolean> {
    this.updateAuthState({ isLoading: true, error: null });

    return of(true).pipe(
      delay(1500),
      tap(() => {
        const newUser: User = {
          id: Date.now().toString(),
          name: userData.name,
          email: userData.email,
          cpf: userData.cpf,
          phone_number: userData.phone_number,
          dt_birth: userData.dt_birth,
          role: UserRole.CUSTOMER
        };

        const permissions = PermissionManager.getPermissionsByRole(UserRole.CUSTOMER);

        this.updateAuthState({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          permissions: permissions
        });

        // Salva no localStorage
        localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
        localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));

        this.notificationService.showSuccess('Cadastro realizado com sucesso!');
      }),
      catchError(error => {
        this.notificationService.showError('Erro no cadastro');
        this.updateAuthState({
          isLoading: false,
          error: 'Erro no cadastro'
        });
        return of(false);
      })
    );
  }

  loginWithSocial(socialUser: SocialUser): Observable<boolean> {
    this.updateAuthState({ isLoading: true, error: null });

    return of(true).pipe(
      delay(800),
      tap(() => {
        // Cria usuário a partir dos dados sociais (sempre como CUSTOMER inicialmente)
        const user: User = {
          id: socialUser.id,
          name: socialUser.name,
          email: socialUser.email,
          cpf: '', // Será preenchido depois no perfil
          phone_number: '', // Será preenchido depois  
          dt_birth: '', // Será preenchido depois
          role: UserRole.CUSTOMER,
          avatar: socialUser.photoUrl
        };

        const permissions = PermissionManager.getPermissionsByRole(UserRole.CUSTOMER);

        // Gera token mock para usuário social
        const mockToken = `social-${socialUser.provider}-token-${Date.now()}`;

        // Salva no localStorage
        localStorage.setItem(this.TOKEN_KEY, mockToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));

        // Atualiza estado
        this.updateAuthState({
          user: user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          permissions: permissions
        });

        console.log(`Usuário ${socialUser.name} logado via ${socialUser.provider}`);
        this.notificationService.showSuccess('Login social realizado com sucesso!');
      }),
      catchError(error => {
        this.updateAuthState({
          isLoading: false,
          error: 'Erro no login social'
        });
        this.notificationService.showError('Erro no login social');
        return of(false);
      })
    );
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  refreshToken(): Observable<string | null> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return of(null);
    }

    // Simulação de refresh token - substitua pela sua API real
    return of(`refreshed-token-${Date.now()}`).pipe(
      delay(1000),
      tap(newToken => {
        if (newToken) {
          localStorage.setItem(this.TOKEN_KEY, newToken);
          // Atualiza o expiry (1 hora a partir de agora)
          const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
          localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry);
        }
      }),
      catchError(error => {
        this.logout();
        return of(null);
      })
    );
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;

    return new Date() > new Date(expiry);
  }

  // Atualize o método de login para salvar refresh token e permissões
  private handleLoginSuccess(rememberMe: boolean = false, role: UserRole = UserRole.CUSTOMER): void {
    const mockUser = this.createMockUser(role);
    const mockToken = 'mock-jwt-token-' + Date.now();
    const mockRefreshToken = 'mock-refresh-token-' + Date.now();
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora
    const permissions = PermissionManager.getPermissionsByRole(role);

    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, mockToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, mockRefreshToken);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry);
      localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
      localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));
      localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
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

  // ========== NOVOS MÉTODOS DE PERMISSÕES ==========

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  hasPermission(permission: keyof UserPermissions): boolean {
    return this.authState.value.permissions[permission];
  }

  /**
   * Verifica se o usuário tem qualquer uma das permissões
   */
  hasAnyPermission(permissions: (keyof UserPermissions)[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Verifica se o usuário tem todas as permissões
   */
  hasAllPermissions(permissions: (keyof UserPermissions)[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): boolean {
    return this.authState.value.user?.role === UserRole.ADMIN;
  }

  /**
   * Retorna as permissões atuais do usuário
   */
  getCurrentPermissions(): UserPermissions {
    return this.authState.value.permissions;
  }

  /**
   * Atualiza as permissões do usuário (útil quando role muda)
   */
  updateUserPermissions(role: UserRole): void {
    const permissions = PermissionManager.getPermissionsByRole(role);

    this.updateAuthState({
      permissions: permissions
    });

    // Atualiza no localStorage também
    localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));

    console.log(`Permissões atualizadas para role: ${role}`, permissions);
  }

  /**
   * Método para simular mudança de role (para testes)
   */
  simulateRoleChange(newRole: UserRole): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };

      localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
      this.updateUserPermissions(newRole);
      this.updateAuthState({ user: updatedUser });

      this.notificationService.showInfo(`Função alterada para: ${newRole}`);
    }
  }

  updateUserProfile(updatedUser: User): void {
    const currentState = this.authState.value;
    this.updateAuthState({
      user: { ...currentState.user, ...updatedUser }
    });
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
  }
}