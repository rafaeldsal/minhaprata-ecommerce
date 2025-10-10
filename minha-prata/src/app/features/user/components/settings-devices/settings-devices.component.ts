import { Component, OnInit, signal } from '@angular/core';
import { DeviceSession } from '../../../../core/models';
import { UserDataService } from 'src/app/core/services/data/user-data.service';

@Component({
  selector: 'app-settings-devices',
  templateUrl: './settings-devices.component.html',
  styleUrls: ['./settings-devices.component.scss']
})
export class SettingsDevicesComponent implements OnInit {
  devices = signal<DeviceSession[]>([]);
  isLoading = signal(true);
  terminatingSession = signal<string | null>(null);
  terminatingAll = signal(false);

  // Estatísticas
  stats = signal({
    total: 0,
    current: 0,
    other: 0
  });

  constructor(private userDataService: UserDataService) { }

  ngOnInit(): void {
    this.loadDevices();
  }

  async loadDevices(): Promise<void> {
    this.isLoading.set(true);

    try {
      const devices = await this.userDataService.getActiveSessions().toPromise();
      this.devices.set(devices || []);
      this.updateStats();
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private updateStats(): void {
    const devices = this.devices();
    const stats = {
      total: devices.length,
      current: devices.filter(d => d.isCurrent).length,
      other: devices.filter(d => !d.isCurrent).length
    };
    this.stats.set(stats);
  }

  async terminateSession(sessionId: string): Promise<void> {
    if (!confirm('Tem certeza que deseja encerrar esta sessão?')) {
      return;
    }

    this.terminatingSession.set(sessionId);

    try {
      await this.userDataService.terminateSession(sessionId).toPromise();

      // Remover da lista localmente
      this.devices.update(devices => devices.filter(d => d.id !== sessionId));
      this.updateStats();

      // Feedback de sucesso
      console.log('Sessão encerrada com sucesso');
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      alert('Erro ao encerrar sessão. Tente novamente.');
    } finally {
      this.terminatingSession.set(null);
    }
  }

  async terminateAllSessions(): Promise<void> {
    if (!confirm('Tem certeza que deseja encerrar todas as outras sessões?\n\nVocê permanecerá logado apenas neste dispositivo.')) {
      return;
    }

    this.terminatingAll.set(true);

    try {
      await this.userDataService.terminateAllSessions().toPromise();

      // Manter apenas a sessão atual
      this.devices.update(devices => devices.filter(d => d.isCurrent));
      this.updateStats();

      // Feedback de sucesso
      console.log('Todas as outras sessões foram encerradas');
    } catch (error) {
      console.error('Erro ao encerrar sessões:', error);
      alert('Erro ao encerrar sessões. Tente novamente.');
    } finally {
      this.terminatingAll.set(false);
    }
  }

  getDeviceIcon(device: string): string {
    const deviceLower = device.toLowerCase();

    if (deviceLower.includes('iphone') || deviceLower.includes('android')) {
      return '📱';
    } else if (deviceLower.includes('mac') || deviceLower.includes('windows')) {
      return '💻';
    } else if (deviceLower.includes('ipad') || deviceLower.includes('tablet')) {
      return '📟';
    } else {
      return '🖥️';
    }
  }

  getBrowserIcon(browser: string): string {
    const browserLower = browser.toLowerCase();

    if (browserLower.includes('chrome')) {
      return '🔴';
    } else if (browserLower.includes('safari')) {
      return '🔵';
    } else if (browserLower.includes('firefox')) {
      return '🟠';
    } else if (browserLower.includes('edge')) {
      return '🔷';
    } else {
      return '🌐';
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffMs = now.getTime() - sessionDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Agora mesmo';
    } else if (diffMins < 60) {
      return `Há ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Há ${diffHours} h`;
    } else if (diffDays === 1) {
      return 'Ontem';
    } else {
      return `Há ${diffDays} dias`;
    }
  }

  getLocationFlag(location: string): string {
    if (location.includes('BR') || location.includes('Brasil')) {
      return '🇧🇷';
    } else if (location.includes('US') || location.includes('USA')) {
      return '🇺🇸';
    } else if (location.includes('PT') || location.includes('Portugal')) {
      return '🇵🇹';
    } else {
      return '🌎';
    }
  }

  refreshDevices(): void {
    this.loadDevices();
  }
}