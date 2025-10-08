import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ignora requisições específicas do loading
    if (req.url.includes('/api/health') || req.method === 'GET' && req.url.includes('/api/config')) {
      return next.handle(req);
    }

    this.activeRequests++;

    // Mostra loading apenas se for a primeira requisição ativa
    if (this.activeRequests === 1) {
      this.loadingService.show();
    }

    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests--;

        // Esconde loading quando não há mais requisições ativas
        if (this.activeRequests === 0) {
          this.loadingService.hide();
        }
      })
    );
  }
}