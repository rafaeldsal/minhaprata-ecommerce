import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastNotification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<ToastNotification[]>([]);
  public notifications$: Observable<ToastNotification[]> = this.notificationsSubject.asObservable();
  private nextId = 0;

  showSuccess(message: string, duration: number = 3000): void {
    this.showNotification('success', message, duration);
  }

  showError(message: string, duration: number = 5000): void {
    this.showNotification('error', message, duration);
  }

  showInfo(message: string, duration: number = 5000): void {
    this.showNotification('info', message, duration);
  }

  showWarning(message: string, duration: number = 5000): void {
    this.showNotification('warning', message, duration);
  }

  private showNotification(type: ToastNotification['type'], message: string, duration: number): void {
    const notification: ToastNotification = {
      id: this.nextId++,
      type,
      message,
      duration
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }

  removeNotification(id: number): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(currentNotifications.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  constructor() { }
}
