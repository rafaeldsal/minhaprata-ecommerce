import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { SocialUser } from '../models/social-user';
import { environment } from 'src/environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private isInitialized = false;
  private currentUserSubject = new BehaviorSubject<SocialUser | null>(null);
  private scriptLoaded = false;

  constructor() { }

  initializeAuth(): Observable<void> {
    return new Observable(observer => {
      if (this.isInitialized) {
        observer.next();
        observer.complete();
        return;
      }

      this.loadGoogleScript().subscribe({
        next: () => {
          this.initializeGoogleAuth();
          observer.next();
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  private loadGoogleScript(): Observable<void> {
    return new Observable(observer => {
      if (this.scriptLoaded) {
        observer.next();
        observer.complete();
        return;
      }

      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        this.scriptLoaded = true;
        observer.next();
        observer.complete();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        console.log('✅ Script Google carregado');
        observer.next();
        observer.complete();
      };
      script.onerror = (error) => {
        console.error('❌ Erro ao carregar script Google:', error);
        observer.error(error);
      };

      document.head.appendChild(script);
    });
  }

  private initializeGoogleAuth(): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: false, // Mudado para false
        use_fedcm_for_prompt: false // Desabilitado para evitar warnings
      });

      this.isInitialized = true;
      console.log('✅ Google Auth inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro na inicialização do Google Auth:', error);
    }
  }

  private handleCredentialResponse(response: any): void {
    console.log('🔐 Resposta do Google recebida');

    if (response.credential) {
      try {
        const payload = this.decodeJWT(response.credential);
        const user = this.mapToSocialUser(payload, response.credential);
        this.currentUserSubject.next(user);
        console.log('✅ Usuário Google autenticado:', user.name);
      } catch (error) {
        console.error('❌ Erro ao processar resposta do Google:', error);
      }
    }
  }

  // NOVO MÉTODO: Abordagem direta sem container complexo
  signIn(): Observable<SocialUser> {
    return new Observable(observer => {
      if (!this.isInitialized) {
        observer.error('Google Auth não inicializado');
        return;
      }

      console.log('🚀 Iniciando login Google...');

      // Método mais direto - usa o prompt do Google
      try {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.warn('⚠️ Prompt não exibido');
          }
          if (notification.isSkippedMoment()) {
            console.warn('⚠️ Prompt ignorado momentaneamente');
          }
          if (notification.isDismissedMoment()) {
            console.warn('⚠️ Prompt dispensado momentaneamente');
          }
        });
      } catch (error) {
        console.error('❌ Erro ao abrir prompt:', error);
      }

      // Polling para verificar autenticação
      const maxAttempts = 90; // Reduzido para 9 segundos
      let attempts = 0;

      const checkUser = () => {
        attempts++;
        const currentUser = this.currentUserSubject.value;

        if (currentUser) {
          console.log('✅ Usuário autenticado encontrado');
          observer.next(currentUser);
          observer.complete();
        } else if (attempts >= maxAttempts) {
          console.warn('⚠️ Tempo limite excedido');
          observer.error('Tempo limite excedido. Tente novamente.');
        } else {
          setTimeout(checkUser, 100);
        }
      };

      checkUser();
    });
  }

  // Método ALTERNATIVO: Usando renderButton em elemento existente
  signInWithButton(element: HTMLElement): Observable<SocialUser> {
    return new Observable(observer => {
      if (!this.isInitialized) {
        observer.error('Google Auth não inicializado');
        return;
      }

      console.log('🚀 Iniciando login via botão...');

      // Limpa qualquer botão anterior
      element.innerHTML = '';

      try {
        google.accounts.id.renderButton(element, {
          theme: 'filled_blue',
          size: 'large',
          type: 'standard',
          width: 250
        });
      } catch (error) {
        console.error('❌ Erro ao renderizar botão:', error);
        observer.error(error);
        return;
      }

      // Polling para verificar autenticação
      const maxAttempts = 120;
      let attempts = 0;

      const checkUser = () => {
        attempts++;
        const currentUser = this.currentUserSubject.value;

        if (currentUser) {
          observer.next(currentUser);
          observer.complete();
        } else if (attempts >= maxAttempts) {
          observer.error('Tempo limite excedido.');
        } else {
          setTimeout(checkUser, 100);
        }
      };

      checkUser();
    });
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
      console.error('❌ Erro ao decodificar JWT:', error);
      throw error;
    }
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

  signOut(): Observable<void> {
    this.currentUserSubject.next(null);

    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.cancel();
      google.accounts.id.disableAutoSelect();
    }

    // Limpa cookies do Google
    document.cookie = 'g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';

    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  getCurrentUser(): SocialUser | null {
    return this.currentUserSubject.value;
  }
}