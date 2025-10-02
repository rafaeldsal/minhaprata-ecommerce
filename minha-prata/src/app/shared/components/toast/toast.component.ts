import { Component, OnInit } from '@angular/core';
import { NotificationService, ToastNotification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {

  notifications: ToastNotification[] = [];
  exitingNotifications: Set<number> = new Set();

  constructor(
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  closeNotification(id: number): void {
    this.exitingNotifications.add(id);
  }

  onAnimationEnd(id: number): void {
    if (this.isExiting(id)) {
      this.notificationService.removeNotification(id);
      this.exitingNotifications.delete(id);
    }
  }

  isExiting(id: number): boolean {
    return this.exitingNotifications.has(id);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-info-circle';
    };
  }

}
