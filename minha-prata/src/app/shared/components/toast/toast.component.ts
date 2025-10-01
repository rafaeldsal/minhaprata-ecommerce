import { Component, OnInit } from '@angular/core';
import { NotificationService, ToastNotification } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {

  notifications: ToastNotification[] = [];

  constructor(
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(
      notifications => this.notifications = this.notifications
    );
  }

  closeNotification(id: number): void {
    this.notificationService.removeNotification(id);
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
