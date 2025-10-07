import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, of, tap } from 'rxjs';
import { AuthState, LoginCredentials, RegisterData, User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authStateSubject: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  private authState = new BehaviorSubject<AuthState>(this.authStateSubject);
  public authState$: Observable<AuthState> = this.authState.asObservable();

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly REMEMBER_ME_KEY = 'remember_me';

  private createMockUser(): User {
    return {
      id: '1',
      name: 'Rafael Silva',
      email: 'rafael@minhaprata.com',
      cpf: '123.456.789-00',
      phone_number: '(11) 99999-9999',
      dt_birth: '1990-01-01',
      role: 'customer',
      avatar: 'https://via.placeholder.com/150'
    };
  }

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const savedUser = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);

    if (savedUser && token) {
      const user = JSON.parse(savedUser);
      this.updateAuthState({
        user: user,
        isAuthenticated: true,
        isLoading: false,
        error: null
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
          this.handleLoginSuccess(credentials.rememberMe);
        } else {
          this.handleLoginFailure();
        }
      })
    );
  }

  private mockLoginValidation(credentials: LoginCredentials): boolean {
    return !!(credentials.email && credentials.password);
  }

  private handleLoginSuccess(rememberMe: boolean = false): void {
    const mockUser = this.createMockUser();
    const mockToken = 'mock-jwt-token'+ Date.now();

    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, mockToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
      localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
    }

    this.updateAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }

  private handleLoginFailure(): void {
    this.updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Email ou senha inválidos'
    });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);

    this.updateAuthState(this.authStateSubject);
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
          role: 'customer'
        };

        this.updateAuthState({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      })
    );
  }
}
