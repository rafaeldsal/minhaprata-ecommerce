import { Component, OnInit, signal } from '@angular/core';
import { SettingsService } from '../../services/user-settings/settings.service';
import { UserSettings } from 'src/app/core/models/user';

interface SettingsTab {
  id: 'account' | 'privacy' | 'notifications' | 'devices' | 'danger';
  label: string;
  icon: string;
}
@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  activeTab = signal<'account' | 'privacy' | 'notifications' | 'devices' | 'danger'>('account');
  settings = signal<UserSettings | null>(null);

  tabs: SettingsTab[] = [
    { id: 'account', label: 'Conta', icon: '👤' },
    { id: 'privacy', label: 'Privacidade', icon: '🔒' },
    { id: 'notifications', label: 'Notificações', icon: '🔔' },
    { id: 'devices', label: 'Dispositivos', icon: '📱' },
    { id: 'danger', label: 'Zona de Risco', icon: '⚠️' }
  ];

  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.settingsService.settings$.subscribe(settings => {
      this.settings.set(settings);
    });
  }

  setActiveTab(tab: 'account' | 'privacy' | 'notifications' | 'devices' | 'danger'): void {
    this.activeTab.set(tab);
  }
}
