import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthState, UserRole, AuthHelper, UserPermissions } from 'src/app/core/models';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-user-auth-icon',
  templateUrl: './user-auth-icon.component.html',
  styleUrls: ['./user-auth-icon.component.scss']
})
export class UserAuthIconComponent implements OnInit, OnDestroy {
  UserRole = UserRole;
  authState: AuthState = AuthHelper.createInitialAuthState();

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
        console.log('🔄 Estado de autenticação atualizado:', state);

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

  // ✅ CORRIGIDO: Usando UserRole do seu enum
  isAdmin(): boolean {
    return this.authState.user?.role === UserRole.ADMIN;
  }

  // ✅ NOVO: Verifica se tem permissão específica
  hasPermission(permission: keyof UserPermissions): boolean {
    return this.authService.hasPermission(permission);
  }

  // ✅ NOVO: Verifica se pode acessar painel admin
  canAccessAdminPanel(): boolean {
    return this.authState.permissions?.canAccessAdminPanel || false;
  }

  // ✅ NOVO: Obtém a role formatada para exibição
  getUserRoleDisplay(): string {
    switch (this.authState.user?.role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.CUSTOMER:
        return 'Cliente';
      default:
        return 'Visitante';
    }
  }

  // ✅ NOVO: Verifica se está carregando
  isLoading(): boolean {
    return this.authState.isLoading;
  }

  // ✅ NOVO: Navega para o painel admin
  goToAdminPanel(): void {
    if (this.canAccessAdminPanel()) {
      this.router.navigate(['/admin']);
      this.closeDropdown();
    }
  }

  // ✅ NOVO: Navega para o perfil do usuário
  goToProfile(): void {
    this.router.navigate(['/user/profile']);
    this.closeDropdown();
  }

  // ✅ NOVO: Navega para histórico de pedidos
  goToOrderHistory(): void {
    this.router.navigate(['/user/orders']);
    this.closeDropdown();
  }

  logout(): void {
    this.authService.logout();
    this.closeDropdown();
    this.router.navigate(['/']);
  }

  // ✅ NOVO: Obtém a URL do avatar ou retorna padrão
  getAvatarUrl(): string {
    return this.authState.user?.avatar || 'assets/images/default-avatar.png';
  }

  // ✅ NOVO: Verifica se há erro de autenticação
  hasError(): boolean {
    return !!this.authState.error;
  }

  // ✅ NOVO: Obtém mensagem de erro (se houver)
  getErrorMessage(): string {
    return this.authState.error || '';
  }

  goToAddresses(): void {
    this.router.navigate(['/address']);
    this.closeDropdown();
  }

  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
    this.closeDropdown();
  }

  goToSettings(): void {
    this.router.navigate(['/user/settings']);
    this.closeDropdown();
  }

  goToHelp(): void {
    this.router.navigate(['/help']);
    this.closeDropdown();
  }

  goToProductManagement(): void {
    this.router.navigate(['/admin/produtos']);
    this.closeDropdown();
  }

  goToUserManagement(): void {
    this.router.navigate(['/admin/usuarios']);
    this.closeDropdown();
  }

  goToAnalytics(): void {
    this.router.navigate(['/admin/relatorios']);
    this.closeDropdown();
  }

  clearError(): void {
    // Recarrega o estado atual da autenticação
    const currentUser = this.authService.getCurrentUser();
    const isAuthenticated = this.authService.isAuthenticated();
    const permissions = this.authService.getCurrentPermissions();

    // Atualiza o estado local para remover o erro
    this.authState = {
      ...this.authState,
      error: null,
      user: currentUser,
      isAuthenticated: isAuthenticated,
      permissions: permissions
    };

    console.log('✅ Erro limpo - estado recarregado');
  }
}