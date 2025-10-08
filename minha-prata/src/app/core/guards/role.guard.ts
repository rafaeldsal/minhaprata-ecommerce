import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[];

  return authService.authState$.pipe(
    take(1),
    map((authState) => {
      const user = authState.user;

      if (!authState.isAuthenticated || !user) {
        return router.createUrlTree(
          ['/login'],
          { queryParams: { returnUrl: state.url } }
        );
      }

      const hasRequiredRole = allowedRoles.includes(user.role as UserRole);

      if (!hasRequiredRole) {
        return router.createUrlTree(['/access-denied']);
      }

      return true;
    })
  );
};
