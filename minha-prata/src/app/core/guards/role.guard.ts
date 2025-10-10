import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';
import { UserRole } from '../models/user/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[];

  return authService.authState$.pipe(
    take(1),
    map((authState) => {
      // Verifica autenticação
      if (!authState.isAuthenticated || !authState.user) {
        return router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
      }

      // Verifica se há roles requeridas
      if (!allowedRoles || allowedRoles.length === 0) {
        return true;
      }

      // Verifica se o usuário tem uma das roles permitidas
      const hasRequiredRole = allowedRoles.includes(authState.user.role);

      if (hasRequiredRole) {
        return true;
      }

      // Acesso negado - redireciona para página de acesso negado
      return router.createUrlTree(['/access-denied']);
    })
  );
};
