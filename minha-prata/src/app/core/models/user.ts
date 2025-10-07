export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone_number: string;
  dt_birth: string;
  role: string;
  avatar?: string;
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
  error: string | null
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}