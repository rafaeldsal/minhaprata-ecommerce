import { User, UserRole, UserPermissions, PermissionManager } from './user.model';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  cpf: string;
  phone_number: string;
  dt_birth: string;
  password: string;
  confirmPassword: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: UserPermissions;
}

export interface SocialUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  provider: 'google';
  idToken?: string;
  accessToken?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// 📋 MÉTODOS AUXILIARES
export class AuthHelper {
  static createInitialAuthState(): AuthState {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      permissions: PermissionManager.getPermissionsByRole(UserRole.CUSTOMER)
    };
  }

  static hasAdminAccess(permissions: UserPermissions): boolean {
    return permissions.canAccessAdminPanel;
  }

  static canManageProducts(permissions: UserPermissions): boolean {
    return permissions.canManageProducts;
  }

  static isValidPassword(password: string): boolean {
    // Mínimo 8 caracteres, pelo menos 1 letra e 1 número
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }
}