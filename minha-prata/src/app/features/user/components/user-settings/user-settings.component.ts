import { Component, OnInit, signal } from '@angular/core';
import { UserSettings } from 'src/app/core/models/';
import { UserDataService } from 'src/app/core/services/data/user-data.service';

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

  constructor(private userDataService: UserDataService) { }

  ngOnInit(): void {
    this.userDataService.settings$.subscribe(settings => {
      this.settings.set(settings);
    });
  }

  setActiveTab(tab: 'account' | 'privacy' | 'notifications' | 'devices' | 'danger'): void {
    this.activeTab.set(tab);
  }
}
