// src/app/core/guards/guard.helper.ts
import { UrlTree } from '@angular/router';
import { AuthState } from '../models/user/user-auth.model';

export class GuardHelper {
  /**
   * Cria URL de redirecionamento para login
   */
  static createLoginRedirect(returnUrl: string): UrlTree {
    // Implementação comum para criar redirect
    // Isso pode ser expandido conforme necessário
    return {} as UrlTree; // Placeholder - você implementa conforme sua necessidade
  }

  /**
   * Verifica se o usuário está autenticado
   */
  static isAuthenticated(authState: AuthState): boolean {
    return authState.isAuthenticated && !!authState.user;
  }

  /**
   * Loga tentativa de acesso negado (para debugging)
   */
  static logAccessDenied(route: string, reason: string): void {
    console.warn(`🚫 Acesso negado à rota: ${route} - Motivo: ${reason}`);
  }
}