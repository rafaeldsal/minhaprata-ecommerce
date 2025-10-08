export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone_number: string;
  dt_birth: string;
  role: string;
  avatar?: string;
  permissions?: UserPermissions;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean
}

export interface RegisterData {
  name: string;
  email: string;
  cpf: string;
  phone_number: string;
  dt_birth: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: UserPermissions;
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export interface UserPermissions {
  // Permissões de administração
  canManageProducts: boolean;
  canManageCategories: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;

  // Permissões de usuário
  canMakePurchases: boolean;
  canManageOwnAddress: boolean;
  canViewOrderHistory: boolean;

  // Permissões gerais
  canAccessAdminPanel: boolean;
}

export class PermissionManager {
  static getPermissionsByRole(role: UserRole): UserPermissions {
    const basePermissions: UserPermissions = {
      canManageProducts: false,
      canManageCategories: false,
      canManageUsers: false,
      canViewAnalytics: false,
      canMakePurchases: true,
      canManageOwnAddress: true,
      canViewOrderHistory: true,
      canAccessAdminPanel: false
    };

    switch (role) {
      case UserRole.ADMIN:
        return {
          ...basePermissions,
          canManageProducts: true,
          canManageCategories: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canAccessAdminPanel: true
        };

      case UserRole.CUSTOMER:
        return {
          ...basePermissions,
          // Customer tem apenas permissões básicas
        };

      default:
        return basePermissions;
    }
  }
}