import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthState, User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-user-auth-icon',
  templateUrl: './user-auth-icon.component.html',
  styleUrls: ['./user-auth-icon.component.scss']
})
export class UserAuthIconComponent implements OnInit, OnDestroy {
  authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  isDropdownOpen = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.authState$.subscribe(
      (state: AuthState) => {
        this.authState = state;
        // Fecha o dropdown quando o estado de autenticação muda
        if (!state.isAuthenticated) {
          this.isDropdownOpen = false;
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Fecha dropdown ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  handleClick(): void {
    if (this.authState.isAuthenticated) {
      this.toggleDropdown();
    } else {
      this.router.navigate(['/login']);
    }
  }

  getFirstName(): string {
    if (!this.authState.user?.name) return 'Usuário';
    return this.authState.user.name.split(' ')[0];
  }

  logout(): void {
    this.authService.logout();
    this.closeDropdown();
    this.router.navigate(['/']);
  }
}