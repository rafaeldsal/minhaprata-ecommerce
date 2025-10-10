import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthState, LoginCredentials } from '../../../../core/models/user/user-auth.model';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;

  loading = false;
  error: string | null = null;
  returnUrl = '/';

  private authSubscription: Subscription | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.loginForm = this.createLoginForm();
  }

  ngOnInit(): void {
    // Redireciona para HOME, não para dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.authSubscription = this.authService.authState$.subscribe(
      (authState: AuthState) => {
        this.handleAuthStateChange(authState);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private createLoginForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  private handleAuthStateChange(authState: AuthState): void {
    this.loading = authState.isLoading;
    this.error = authState.error;

    // Se autenticado e não está carregando, redireciona
    if (authState.isAuthenticated && !authState.isLoading) {
      this.ngZone.run(() => {
        this.router.navigate([this.returnUrl]);
      });
    }
  }

  onSubmit(): void {
    // ETAPA 4.10.1 - Marcar todos os campos como touched
    this.markFormGroupTouched();

    // ETAPA 4.10.2 - Verificar se formulário é válido
    if (this.loginForm.invalid) {
      this.error = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    // ETAPA 4.10.3 - Preparar credentials
    const credentials: LoginCredentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('rememberMe')?.value
    };

    // ETAPA 4.10.4 - Chamar serviço de autenticação
    this.authService.login(credentials).subscribe({
      error: (err) => {
        // Erro já é tratado no AuthService, mas podemos logar aqui
        console.error('Login error:', err);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }


  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get rememberMe() { return this.loginForm.get('rememberMe'); }

  clearError(): void {
    this.error = null;
  }
}
