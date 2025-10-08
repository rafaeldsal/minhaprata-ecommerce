import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adiciona o token de autenticação se disponível
    const authReq = this.addAuthHeader(req);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Trata erros de autenticação (401 Unauthorized)
        if (error.status === 401 && !req.url.includes('/auth/refresh')) {
          return this.handle401Error(authReq, next);
        }

        // Trata erros de permissão (403 Forbidden)
        if (error.status === 403) {
          this.handle403Error();
          return throwError(() => error);
        }

        // Propaga outros erros
        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();

    if (token && this.shouldAddToken(request)) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return request;
  }

  private shouldAddToken(request: HttpRequest<any>): boolean {
    // Não adiciona token para rotas públicas
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/public/'
    ];

    return !publicRoutes.some(route => request.url.includes(route));
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: string | null) => {
          if (token) {
            this.refreshTokenSubject.next(token);
            return next.handle(this.addAuthHeader(request));
          }

          // Se não conseguiu renovar, faz logout
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Session expired'));
        }),
        catchError((error) => {
          // Erro ao renovar token, faz logout
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Espera até que o token seja renovado
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => next.handle(this.addAuthHeader(request)))
      );
    }
  }

  private handle403Error(): void {
    // Usuário não tem permissão para acessar o recurso
    this.router.navigate(['/access-denied']);
  }
}