import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ignora requisições específicas do loading
    if (req.url.includes('/api/health') || req.method === 'GET' && req.url.includes('/api/config')) {
      return next.handle(req);
    }

    this.activeRequests++;

    // Mostra loading apenas se for a primeira requisição ativa
    if (this.activeRequests === 1) {
      this.loadingService.show();
      console.log('⏳ Loading iniciado para:', req.url);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // ADICIONE NOTIFICAÇÕES ESPECÍFICAS AQUI TAMBÉM ↓
        if (error.status === 0) {
          this.notificationService.showError('Erro de conexão. Verifique sua internet.');
        } else if (error.status >= 500) {
          this.notificationService.showError('Servidor indisponível. Tente novamente mais tarde.');
        }

        return throwError(() => error);
      }),
      finalize(() => {
        this.activeRequests--;

        // Esconde loading quando não há mais requisições ativas
        if (this.activeRequests === 0) {
          this.loadingService.hide();
          console.log('✅ Loading finalizado');
        }
      })
    );
  }
}