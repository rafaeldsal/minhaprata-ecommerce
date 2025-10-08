import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.authService.authState$.subscribe(authState => {
      this.currentUser = authState.user;
    });
  }

  formatBirthDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.showInfo('Logout realizado com sucesso!');
  }

  updateProfile(): void {
    // Exemplo para quando implementar edição de perfil
    this.notificationService.showSuccess('Perfil atualizado com sucesso!');
  }

  handleError(message: string): void {
    this.notificationService.showError(message);
  }
}
