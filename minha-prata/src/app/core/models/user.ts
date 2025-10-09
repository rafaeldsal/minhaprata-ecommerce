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
  address?: UserAddress[];
  notifications_enabled?: boolean;
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

export interface UserAddress {
  id: string;
  title: string; // 'Casa', 'Trabalho', etc
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone_number?: string;
  dt_birth?: string;
  avatar?: string;
  notifications_enabled?: boolean;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
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

// src/app/types/user.types.ts
export interface UserSettings {
  account: AccountSettings;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  devices: DeviceSession[];
}

export interface AccountSettings {
  email: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface PrivacySettings {
  // Dados de Compras e Perfil
  showPurchaseHistory: boolean;
  showWishlist: boolean;
  hideOrderPrices: boolean;

  // Marketing e Recomendações
  personalizedRecommendations: boolean;
  priceDropNotifications: boolean;
  abandonedCartReminders: boolean;
  productReviewReminders: boolean;

  // Compartilhamento de Dados
  dataSharing: boolean;
  thirdPartyMarketing: boolean;
  browserTracking: boolean;

  // Segurança e Pagamentos
  savePaymentMethods: boolean;
  quickCheckout: boolean;
  orderTrackingAlerts: boolean;
}

export interface NotificationSettings {
  email: EmailNotifications;
  push: PushNotifications;
  sms: SMSNotifications;
}

export interface EmailNotifications {
  promotions: boolean;
  security: boolean;
  orderUpdates: boolean;
  newsletter: boolean;
}

export interface PushNotifications {
  orderUpdates: boolean;
  priceDrops: boolean;
  newFeatures: boolean;
}

export interface SMSNotifications {
  orderUpdates: boolean;
  securityAlerts: boolean;
}

export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
  ipAddress: string;
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

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: PermissionManager.getPermissionsByRole(UserRole.CUSTOMER)
};