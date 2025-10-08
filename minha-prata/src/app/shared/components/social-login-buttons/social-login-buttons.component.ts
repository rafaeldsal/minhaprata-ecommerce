import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { SocialAuthService } from 'src/app/core/services/social-auth.service';

declare var google: any;

@Component({
  selector: 'app-social-login-buttons',
  templateUrl: './social-login-buttons.component.html',
  styleUrls: ['./social-login-buttons.component.scss']
})
export class SocialLoginButtonsComponent implements OnInit {
  isLoading = false;
  currentProvider: 'google' | null = null;

  private googleClientId = environment.googleClientId;

  constructor(
    private socialAuthService: SocialAuthService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.validateGoogleConfig();
    this.socialAuthService.initializeSocialAuth().subscribe({
      next: () => {
        console.log('✅ Serviço de auth social inicializado');
      },
      error: (error) => {
        console.warn('⚠️ Auth social não inicializou:', error);
      }
    });
  }

  private validateGoogleConfig(): void {
    if (!this.googleClientId || this.googleClientId === 'SEU_GOOGLE_CLIENT_ID_AQUI') {
      console.warn('⚠️ Google Client ID não configurado em environment.ts');
    } else {
      console.log('✅ Google Client ID configurado');
    }
  }

  signInWithGoogle(): void {
    if (!this.googleClientId || this.googleClientId === 'SEU_GOOGLE_CLIENT_ID_AQUI') {
      this.handleSocialLoginError('Google Sign-In não configurado. Verifique o environment.ts');
      return;
    }

    this.isLoading = true;
    this.currentProvider = 'google';

    console.log('🔐 Iniciando autenticação Google...');

    this.socialAuthService.signInWithGoogle().subscribe({
      next: (socialUser) => {
        console.log('✅ Login Google bem-sucedido:', socialUser);
        this.handleSocialLoginSuccess(socialUser);
      },
      error: (error) => {
        console.error('❌ Erro no login Google:', error);
        this.handleSocialLoginError(this.getGoogleErrorMessage(error));
      }
    });
  }

  private getGoogleErrorMessage(error: any): string {
    console.log('🔍 Analisando erro:', error);

    if (typeof error === 'string') {
      return error;
    }

    const errorMap: { [key: string]: string } = {
      'popup_closed_by_user': 'Login cancelado pelo usuário',
      'access_denied': 'Acesso negado pelo Google',
      'immediate_failed': 'Falha no login automático',
      'idpiframe_initialization_failed': 'Falha na inicialização do Google Auth'
    };

    return errorMap[error?.type] ||
      error?.message ||
      'Erro no login com Google. Tente novamente.';
  }

  private handleSocialLoginSuccess(socialUser: any): void {
    console.log('✅ Login social bem-sucedido:', socialUser);
    this.isLoading = false;
    this.currentProvider = null;

    this.authService.loginWithSocial(socialUser).subscribe({
      next: (success) => {
        if (success) {
          console.log('🎉 Login social integrado com sucesso!');
        } else {
          this.handleSocialLoginError('Falha na integração com o sistema');
        }
      },
      error: (error) => {
        this.handleSocialLoginError(error);
      }
    });
  }

  private handleSocialLoginError(error: any): void {
    console.error('❌ Erro no login social:', error);
    this.isLoading = false;
    this.currentProvider = null;

    const errorMessage = typeof error === 'string' ? error :
      error?.error?.message || 'Erro no login social';

    alert(`Erro: ${errorMessage}`);
  }
}