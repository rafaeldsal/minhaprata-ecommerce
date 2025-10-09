// src/app/features/user/services/user-settings/settings.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserSettings, AccountSettings, PrivacySettings, NotificationSettings, DeviceSession } from '../../../../core/models/user';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<UserSettings>(this.getDefaultSettings());
  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.loadSettings();
  }

  // Account Settings
  updateAccountSettings(settings: Partial<AccountSettings>): Observable<boolean> {
    const current = this.settingsSubject.value;
    const updated = {
      ...current,
      account: { ...current.account, ...settings }
    };

    this.saveSettings(updated);
    return of(true).pipe(delay(500));
  }

  // Privacy Settings
  updatePrivacySettings(settings: Partial<PrivacySettings>): Observable<boolean> {
    const current = this.settingsSubject.value;
    const updated = {
      ...current,
      privacy: { ...current.privacy, ...settings }
    };

    this.saveSettings(updated);
    return of(true).pipe(delay(500));
  }

  // Notification Settings
  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<boolean> {
    const current = this.settingsSubject.value;
    const updated = {
      ...current,
      notifications: { ...current.notifications, ...settings }
    };

    this.saveSettings(updated);
    return of(true).pipe(delay(500));
  }

  // Devices Management
  getActiveSessions(): Observable<DeviceSession[]> {
    const sessions = this.generateMockSessions();
    return of(sessions).pipe(delay(300));
  }

  terminateSession(sessionId: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  terminateAllSessions(): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  // Data Export
  exportUserData(): Observable<boolean> {
    return of(true).pipe(delay(1000));
  }

  // Account Deletion
  deleteAccount(): Observable<boolean> {
    return of(true).pipe(delay(2000));
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('user-settings');
    if (saved) {
      try {
        this.settingsSubject.next(JSON.parse(saved));
      } catch {
        this.settingsSubject.next(this.getDefaultSettings());
      }
    }
  }

  private saveSettings(settings: UserSettings): void {
    localStorage.setItem('user-settings', JSON.stringify(settings));
    this.settingsSubject.next(settings);
  }

  private getDefaultSettings(): UserSettings {
    return {
      account: {
        email: 'usuario@exemplo.com',
        phone: '+55 (11) 99999-9999',
        emailVerified: true,
        phoneVerified: false,
        twoFactorEnabled: false
      },
      privacy: {
        // Dados de Compras e Perfil
        showPurchaseHistory: true,
        showWishlist: false,
        hideOrderPrices: false,

        // Marketing e Recomendações
        personalizedRecommendations: true,
        priceDropNotifications: true,
        abandonedCartReminders: true,
        productReviewReminders: true,

        // Compartilhamento de Dados
        dataSharing: false,
        thirdPartyMarketing: false,
        browserTracking: true,

        // Segurança e Pagamentos
        savePaymentMethods: true,
        quickCheckout: false,
        orderTrackingAlerts: true
      },
      notifications: {
        email: {
          promotions: true,
          security: true,
          orderUpdates: true,
          newsletter: false
        },
        push: {
          orderUpdates: true,
          priceDrops: false,
          newFeatures: true
        },
        sms: {
          orderUpdates: false,
          securityAlerts: true
        }
      },
      devices: []
    };
  }

  private generateMockSessions(): DeviceSession[] {
    return [
      {
        id: '1',
        device: 'iPhone 13',
        browser: 'Safari',
        location: 'São Paulo, BR',
        lastActive: new Date(),
        isCurrent: true,
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        device: 'MacBook Pro',
        browser: 'Chrome',
        location: 'São Paulo, BR',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isCurrent: false,
        ipAddress: '192.168.1.101'
      }
    ];
  }
}