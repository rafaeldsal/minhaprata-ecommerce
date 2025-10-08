import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { UserPermissions } from '../../../../core/models/user';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  permissions: UserPermissions;

  constructor(public authService: AuthService) {
    this.permissions = this.authService.getCurrentPermissions();
  }

  logout(): void {
    this.authService.logout();
  }
}