import { UserAddress } from "../shared/address.model";

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone_number: string;
  dt_birth: string;
  role: UserRole;
  avatar?: string;
  permissions?: UserPermissions;
  address?: UserAddress[];
  notifications_enabled?: boolean;
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

// 📋 MÉTODOS AUXILIARES
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
        return basePermissions;

      default:
        return basePermissions;
    }
  }

  static canAccess(permissions: UserPermissions, permission: keyof UserPermissions): boolean {
    return permissions[permission];
  }
}

// 🏷️ VALIDAÇÕES
export class UserValidator {
  static isValidCPF(cpf: string): boolean {
    // Implementação de validação de CPF
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isAdult(birthDate: string): boolean {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return age >= 18;
  }
}