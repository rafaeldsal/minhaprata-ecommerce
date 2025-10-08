import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { UserPermissions, UserRole } from '../../../../core/models/user';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  permissions: UserPermissions;
  userRole: UserRole;
  isDevelopment = !environment.production; 
  stats = {
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalOrders: 0
  };

  // Torna o authService público para o template
  constructor(public authService: AuthService) {
    const currentUser = this.authService.getCurrentUser();
    this.userRole = currentUser?.role as UserRole || UserRole.CUSTOMER;
    this.permissions = this.authService.getCurrentPermissions();
  }

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    setTimeout(() => {
      this.stats = {
        totalProducts: 156,
        totalCategories: 12,
        totalUsers: 89,
        totalOrders: 342
      };
    }, 1000);
  }

  simulateRoleChange(): void {
    if (!this.isDevelopment) return; // Só funciona em desenvolvimento

    const newRole = this.userRole === UserRole.ADMIN ? UserRole.CUSTOMER : UserRole.ADMIN;
    this.authService.simulateRoleChange(newRole);
    this.userRole = newRole;
    this.permissions = this.authService.getCurrentPermissions();
  }
}