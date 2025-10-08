import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { SocialAuthService } from 'src/app/core/services/social-auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SocialUser } from 'src/app/core/models/social-user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-social-login-buttons',
  templateUrl: './social-login-buttons.component.html',
  styleUrls: ['./social-login-buttons.component.scss']
})
export class SocialLoginButtonsComponent implements OnInit {
  @ViewChild('googleButtonContainer') googleButtonContainer!: ElementRef;

  isLoading = false;
  currentProvider: 'google' | null = null;

  private googleClientId = environment.googleClientId;

  constructor(
    private socialAuthService: SocialAuthService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
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
    if (this.isLoading) return;

    console.log('🔐 Iniciando autenticação Google...');
    this.isLoading = true;
    this.currentProvider = 'google';

    this.socialAuthService.signInWithGoogle().subscribe({
      next: (socialUser: SocialUser) => {
        console.log('✅ Login Google bem-sucedido:', socialUser.name);
        this.handleSocialLoginSuccess(socialUser);
      },
      error: (error) => {
        console.error('❌ Erro no login Google:', error);
        this.handleSocialLoginError(error);
        this.isLoading = false;
        this.currentProvider = null;
      }
    });
  }

  // Método alternativo usando botão renderizado
  useGoogleButton(): void {
    if (this.isLoading) return;

    console.log('🔐 Usando botão Google renderizado...');
    this.isLoading = true;
    this.currentProvider = 'google';

    // Mostra o container
    this.googleButtonContainer.nativeElement.style.display = 'block';

    // Usa o método com botão renderizado
    // (Você precisaria adicionar este método ao SocialAuthService)
  }

  private handleSocialLoginSuccess(socialUser: SocialUser): void {
    this.authService.loginWithSocial(socialUser).subscribe({
      next: (success) => {
        this.isLoading = false;
        this.currentProvider = null;

        if (success) {
          this.notificationService.showSuccess('Login com Google realizado com sucesso!');
          this.router.navigate(['/']);
        } else {
          this.handleSocialLoginError('Falha na integração com o sistema');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.currentProvider = null;
        this.handleSocialLoginError(error);
      }
    });
  }

  private handleSocialLoginError(error: any): void {
    console.error('🔍 Analisando erro:', error);

    let errorMessage = 'Erro no login social';

    if (error?.message?.includes('Tempo limite')) {
      errorMessage = 'Tempo limite excedido. Tente novamente.';
    } else if (error?.message?.includes('popup') || error?.message?.includes('bloqueado')) {
      errorMessage = 'Popup bloqueado. Permita popups para este site.';
    } else if (error?.message?.includes('CORS')) {
      errorMessage = 'Erro de configuração. Verifique as credenciais do Google.';
    } else if (error?.message?.includes('cancelado')) {
      errorMessage = 'Login cancelado pelo usuário.';
      return; // Não mostra notificação para cancelamento
    }

    this.notificationService.showError(errorMessage);
  }
}