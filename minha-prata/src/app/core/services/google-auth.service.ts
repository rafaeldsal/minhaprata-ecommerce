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

  constructor() { }

  initializeAuth(): Observable<void> {
    return new Observable(observer => {
      if (this.isInitialized) {
        observer.next();
        observer.complete();
        return;
      }

      // Carrega o script do Google
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Inicializa o Google Identity Services
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: this.handleCredentialResponse.bind(this)
        });

        this.isInitialized = true;
        console.log('✅ Google Auth inicializado');
        observer.next();
        observer.complete();
      };
      script.onerror = (error) => {
        console.error('❌ Erro ao carregar Google Auth:', error);
        observer.error(error);
      };
      document.head.appendChild(script);
    });
  }

  private handleCredentialResponse(response: any): void {
    console.log('🔐 Resposta do Google:', response);

    if (response.credential) {
      try {
        const payload = this.decodeJWT(response.credential);
        const user = this.mapToSocialUser(payload, response.credential);
        this.currentUserSubject.next(user);
        console.log('✅ Usuário Google autenticado:', user);
      } catch (error) {
        console.error('❌ Erro ao processar resposta do Google:', error);
      }
    }
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

  signIn(): Observable<SocialUser> {
    return new Observable(observer => {
      if (!this.isInitialized) {
        observer.error('Google Auth não inicializado');
        return;
      }

      console.log('🚀 Iniciando login Google...');

      // Abre o popup de login do Google
      google.accounts.id.prompt();

      // Usamos um listener para capturar a resposta
      // O callback handleCredentialResponse será chamado automaticamente
      // quando o usuário completar o login

      // Polling para verificar se o usuário foi autenticado
      const maxAttempts = 60; // 6 segundos
      let attempts = 0;

      const checkUser = () => {
        attempts++;
        const currentUser = this.currentUserSubject.value;

        if (currentUser) {
          console.log('✅ Usuário autenticado encontrado:', currentUser);
          observer.next(currentUser);
          observer.complete();
        } else if (attempts >= maxAttempts) {
          observer.error('Tempo limite excedido. Login não concluído.');
        } else {
          setTimeout(checkUser, 100);
        }
      };

      checkUser();
    });
  }

  signOut(): Observable<void> {
    this.currentUserSubject.next(null);

    // Limpa qualquer estado do Google
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }

    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  getCurrentUser(): SocialUser | null {
    return this.currentUserSubject.value;
  }
}