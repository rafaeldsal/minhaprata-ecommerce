import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔄 Interceptor: Processando requisição para', req.url);

    const authReq = this.addAuthHeader(req);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Interceptor: Erro HTTP', error.status, error.url);

        // ADICIONE NOTIFICAÇÕES ESPECÍFICAS PARA CADA ERRO ↓

        if (error.status === 401 && !req.url.includes('/auth/refresh')) {
          this.notificationService.showWarning('Sessão expirada. Renovando autenticação...');
          return this.handle401Error(authReq, next);
        }

        if (error.status === 403) {
          this.notificationService.showError('Acesso negado. Você não tem permissão para esta ação.');
          this.handle403Error();
          return throwError(() => error);
        }

        if (error.status === 404) {
          this.notificationService.showWarning('Recurso não encontrado.');
          return throwError(() => error);
        }

        if (error.status >= 500) {
          this.notificationService.showError('Erro interno do servidor. Tente novamente mais tarde.');
          return throwError(() => error);
        }

        // Erro genérico de rede/outros
        if (error.status === 0) {
          this.notificationService.showError('Erro de conexão. Verifique sua internet.');
        } else {
          this.notificationService.showError(`Erro: ${error.message || 'Erro desconhecido'}`);
        }

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
            this.notificationService.showSuccess('Sessão renovada com sucesso!');
            return next.handle(this.addAuthHeader(request));
          }

          // Se não conseguiu renovar, faz logout
          this.authService.logout();
          this.router.navigate(['/login']);
          this.notificationService.showError('Sessão expirada. Faça login novamente.');
          return throwError(() => new Error('Session expired'));
        }),
        catchError((error) => {
          // Erro ao renovar token, faz logout
          this.authService.logout();
          this.router.navigate(['/login']);
          this.notificationService.showError('Falha na renovação da sessão. Faça login novamente.');

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