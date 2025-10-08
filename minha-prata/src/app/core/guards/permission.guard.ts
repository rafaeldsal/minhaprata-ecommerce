import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserPermissions } from '../models/user';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Se não está autenticado, redireciona para login
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredPermissions = route.data['permissions'] as (keyof UserPermissions)[];
  const requireAll = route.data['requireAll'] !== false; // Default true

  // Se não há permissões requeridas, permite acesso
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const hasAccess = requireAll
    ? authService.hasAllPermissions(requiredPermissions)
    : authService.hasAnyPermission(requiredPermissions);

  if (hasAccess) {
    return true;
  }

  notificationService.showError('Você não tem permissão para acessar esta página.');
  router.navigate(['/']);
  return false;
};