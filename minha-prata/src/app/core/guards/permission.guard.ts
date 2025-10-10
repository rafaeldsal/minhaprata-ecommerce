import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { NotificationService } from '../services/shared/notification.service';
import { UserPermissions } from '../models/user/user.model';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Verifica autenticação primeiro
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredPermissions = route.data['permissions'] as (keyof UserPermissions)[];
  const requireAll = route.data['requireAll'] ?? true; // Default: requer todas as permissões

  // Se não há permissões requeridas, permite acesso
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Verifica permissões
  const hasAccess = requireAll
    ? authService.hasAllPermissions(requiredPermissions)
    : authService.hasAnyPermission(requiredPermissions);

  if (hasAccess) {
    return true;
  }

  // Acesso negado
  notificationService.showError('Você não tem permissão para acessar esta página.');
  router.navigate(['/']);
  return false;
};