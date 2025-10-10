import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UserRole, ChangePasswordData, UpdateProfileData, UserAddress, UserSettings, AccountSettings, PrivacySettings, NotificationSettings, DeviceSession, SettingsHelper } from '../../models/';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private readonly API_URL = `${environment.apiUrl}/user`;
  private readonly SETTINGS_STORAGE_KEY = 'minhaprata_user_settings';

  private settingsSubject = new BehaviorSubject<UserSettings>(SettingsHelper.getDefaultSettings());
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSettings();
  }

  // ========== 👤 MÉTODOS DE PERFIL ==========

  /**
   * Atualiza perfil do usuário
   */
  updateProfile(userId: string, data: UpdateProfileData): Observable<User> {
    console.log('📤 Atualizando perfil:', data);

    // Mock - substituir por API real depois
    return of({
      id: userId,
      name: data.name || 'Mock User',
      email: data.email || 'mock@email.com',
      cpf: '12345678900',
      phone_number: data.phone_number || '(11) 99999-9999',
      dt_birth: data.dt_birth || '1990-01-01',
      role: UserRole.CUSTOMER,
      avatar: data.avatar,
      notifications_enabled: data.notifications_enabled ?? true
    }).pipe(delay(800));
  }

  /**
   * Atualiza avatar do usuário
   */
  updateAvatar(userId: string, avatarFile: File): Observable<{ avatarUrl: string }> {
    console.log('🖼 Upload de avatar:', avatarFile.name);

    // Mock - simular upload
    return of({
      avatarUrl: 'https://via.placeholder.com/150'
    }).pipe(delay(1200));
  }

  /**
   * Altera senha do usuário
   */
  changePassword(userId: string, data: ChangePasswordData): Observable<{ success: boolean; message: string }> {
    console.log('🔐 Alterando senha para usuário:', userId);

    // Verifica se é usuário Google
    const currentUser = this.getCurrentUserFromStorage();
    if (currentUser?.provider === 'google') {
      return of({
        success: false,
        message: 'Usuários que fizeram login com Google não podem alterar senha por aqui.'
      });
    }

    // Simulação de validação
    return new Observable(observer => {
      setTimeout(() => {
        // Mock validation - senha atual deve ser "123456" para funcionar
        if (data.current_password === '123456') {
          observer.next({
            success: true,
            message: 'Senha alterada com sucesso!'
          });
        } else {
          observer.next({
            success: false,
            message: 'Senha atual incorreta. A senha mock é "123456".'
          });
        }
        observer.complete();
      }, 1500);
    });
  }

  // ========== 🏠 MÉTODOS DE ENDEREÇO ==========

  /**
   * Obtém endereços do usuário
   */
  getAddresses(userId: string): Observable<UserAddress[]> {
    const mockAddresses: UserAddress[] = [
      {
        id: '1',
        title: 'Casa',
        zip_code: '01234-567',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Jardim Paulista',
        city: 'São Paulo',
        state: 'SP',
        is_default: true,
        recipientName: 'João Silva',
        phone: '(11) 99999-9999'
      },
      {
        id: '2',
        title: 'Trabalho',
        zip_code: '04567-890',
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        is_default: false,
        recipientName: 'João Silva',
        phone: '(11) 99999-9999'
      }
    ];
    return of(mockAddresses).pipe(delay(500));
  }

  /**
   * Adiciona novo endereço
   */
  addAddress(userId: string, address: UserAddress): Observable<UserAddress> {
    console.log('🏠 Adicionando endereço:', address);
    return of({
      ...address,
      id: Date.now().toString()
    }).pipe(delay(600));
  }

  /**
   * Atualiza endereço existente
   */
  updateAddress(userId: string, addressId: string, address: UserAddress): Observable<UserAddress> {
    console.log('✏️ Atualizando endereço:', addressId, address);
    return of({
      ...address,
      id: addressId
    }).pipe(delay(600));
  }

  /**
   * Remove endereço
   */
  deleteAddress(userId: string, addressId: string): Observable<{ message: string }> {
    console.log('🗑️ Removendo endereço:', addressId);
    return of({
      message: 'Endereço removido com sucesso'
    }).pipe(delay(400));
  }

  /**
   * Define endereço padrão
   */
  setDefaultAddress(userId: string, addressId: string): Observable<UserAddress[]> {
    console.log('⭐ Definindo endereço padrão:', addressId);
    return this.getAddresses(userId); // Retorna lista atualizada
  }

  // ========== ⚙️ MÉTODOS DE CONFIGURAÇÕES ==========

  /**
   * Atualiza configurações da conta
   */
  updateAccountSettings(settings: Partial<AccountSettings>): Observable<boolean> {
    const current = this.settingsSubject.value;
    const updated = {
      ...current,
      account: { ...current.account, ...settings }
    };

    this.saveSettings(updated);
    return of(true).pipe(delay(500));
  }

  /**
   * Atualiza configurações de privacidade
   */
  updatePrivacySettings(settings: Partial<PrivacySettings>): Observable<boolean> {
    const current = this.settingsSubject.value;
    const updated = {
      ...current,
      privacy: { ...current.privacy, ...settings }
    };

    this.saveSettings(updated);
    return of(true).pipe(delay(500));
  }

  /**
   * Atualiza configurações de notificação
   */
  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<boolean> {
    const current = this.settingsSubject.value;
    const updated = {
      ...current,
      notifications: { ...current.notifications, ...settings }
    };

    this.saveSettings(updated);
    return of(true).pipe(delay(500));
  }

  /**
   * Atualiza todas as configurações
   */
  updateAllSettings(settings: Partial<UserSettings>): Observable<boolean> {
    const current = this.settingsSubject.value;
    const updated = {
      ...current,
      ...settings
    };

    this.saveSettings(updated);
    return of(true).pipe(delay(600));
  }

  // ========== 📱 MÉTODOS DE DISPOSITIVOS ==========

  /**
   * Obtém sessões ativas
   */
  getActiveSessions(): Observable<DeviceSession[]> {
    const sessions = this.generateMockSessions();
    return of(sessions).pipe(delay(300));
  }

  /**
   * Encerra sessão específica
   */
  terminateSession(sessionId: string): Observable<boolean> {
    console.log('🔒 Encerrando sessão:', sessionId);
    return of(true).pipe(delay(500));
  }

  /**
   * Encerra todas as outras sessões
   */
  terminateAllSessions(): Observable<boolean> {
    console.log('🔒 Encerrando todas as outras sessões');
    return of(true).pipe(delay(500));
  }

  /**
   * Obtém dispositivo atual
   */
  getCurrentDevice(): DeviceSession | undefined {
    const sessions = this.generateMockSessions();
    return sessions.find(session => session.isCurrent);
  }

  // ========== 📊 MÉTODOS DE DADOS ==========

  /**
   * Exporta dados do usuário
   */
  exportUserData(): Observable<boolean> {
    console.log('📤 Exportando dados do usuário');
    return of(true).pipe(delay(1000));
  }

  /**
   * Exclui conta do usuário
   */
  deleteAccount(): Observable<boolean> {
    console.log('🗑️ Excluindo conta do usuário');
    return of(true).pipe(delay(2000));
  }

  /**
   * Obtém estatísticas do usuário
   */
  getUserStats(userId: string): Observable<{
    totalOrders: number;
    totalSpent: number;
    favoriteCategory: string;
    memberSince: string;
  }> {
    const stats = {
      totalOrders: 12,
      totalSpent: 2450.75,
      favoriteCategory: 'Anéis',
      memberSince: '2024-01-15'
    };
    return of(stats).pipe(delay(400));
  }

  // ========== 🛠️ MÉTODOS PRIVADOS ==========

  /**
   * Carrega configurações do localStorage
   */
  private loadSettings(): void {
    const saved = localStorage.getItem(this.SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Converte strings de data para objetos Date
        const settingsWithDates = {
          ...parsed,
          devices: parsed.devices?.map((device: any) => ({
            ...device,
            lastActive: new Date(device.lastActive)
          })) || []
        };
        this.settingsSubject.next(settingsWithDates);
      } catch {
        this.settingsSubject.next(SettingsHelper.getDefaultSettings());
      }
    }
  }

  /**
   * Salva configurações no localStorage
   */
  private saveSettings(settings: UserSettings): void {
    localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    this.settingsSubject.next(settings);
  }

  /**
   * Obtém usuário atual do storage
   */
  private getCurrentUserFromStorage(): any {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Gera sessões mock para demonstração
   */
  private generateMockSessions(): DeviceSession[] {
    return [
      {
        id: '1',
        device: 'iPhone 13 Pro',
        browser: 'Safari 16.0',
        location: 'São Paulo, BR',
        lastActive: new Date(),
        isCurrent: true,
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        device: 'MacBook Pro',
        browser: 'Chrome 119.0',
        location: 'São Paulo, BR',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        isCurrent: false,
        ipAddress: '192.168.1.101'
      },
      {
        id: '3',
        device: 'Samsung Galaxy S21',
        browser: 'Chrome Mobile',
        location: 'Rio de Janeiro, BR',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
        isCurrent: false,
        ipAddress: '177.200.40.150'
      }
    ];
  }

  // ========== 🧪 MÉTODOS PARA DESENVOLVIMENTO ==========

  /**
   * Reseta configurações para padrão
   */
  resetSettings(): void {
    this.settingsSubject.next(SettingsHelper.getDefaultSettings());
    localStorage.removeItem(this.SETTINGS_STORAGE_KEY);
    console.log('⚙️ Configurações resetadas para padrão');
  }

  /**
   * Adiciona sessão mock para testes
   */
  addMockSession(): void {
    const currentSessions = this.settingsSubject.value.devices;
    const newSession: DeviceSession = {
      id: `mock-${Date.now()}`,
      device: 'Dispositivo de Teste',
      browser: 'Browser Test',
      location: 'Localização Teste',
      lastActive: new Date(),
      isCurrent: false,
      ipAddress: '192.168.1.999'
    };

    const updatedSettings = {
      ...this.settingsSubject.value,
      devices: [...currentSessions, newSession]
    };

    this.saveSettings(updatedSettings);
    console.log('📱 Sessão mock adicionada');
  }
}