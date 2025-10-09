import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { SettingsService } from '../../services/user-settings/settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-danger-zone',
  templateUrl: './settings-danger-zone.component.html',
  styleUrls: ['./settings-danger-zone.component.scss']
})
export class SettingsDangerZoneComponent {
  @ViewChild('confirmInput') confirmInput!: ElementRef<HTMLInputElement>;

  // Estados de loading
  isExporting = signal(false);
  isDeleting = signal(false);

  // Estados dos modais
  showExportModal = signal(false);
  showDeleteModal = signal(false);

  // Confirmação por texto
  confirmationText = signal('');
  requiredText = 'EXCLUIR MINHA CONTA';

  constructor(
    private settingsService: SettingsService,
    private router: Router
  ) { }

  // 🔹 Exportação de Dados
  async exportData(): Promise<void> {
    this.isExporting.set(true);

    try {
      await this.settingsService.exportUserData().toPromise();

      // Simular download (em produção, seria um arquivo real)
      this.showExportModal.set(true);

      // Feedback visual
      console.log('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('❌ Erro ao exportar dados. Tente novamente.');
    } finally {
      this.isExporting.set(false);
    }
  }

  // 🔹 Exclusão de Conta
  async deleteAccount(): Promise<void> {
    if (this.confirmationText() !== this.requiredText) {
      alert('❌ Por favor, digite exatamente: ' + this.requiredText);
      return;
    }

    this.isDeleting.set(true);

    try {
      await this.settingsService.deleteAccount().toPromise();

      // Feedback de sucesso
      alert('✅ Sua conta foi excluída com sucesso.');

      // Limpar dados locais
      localStorage.removeItem('user-settings');
      localStorage.removeItem('user-payment-methods');

      // Redirecionar para home
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);

    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('❌ Erro ao excluir conta. Tente novamente.');
    } finally {
      this.isDeleting.set(false);
      this.showDeleteModal.set(false);
      this.confirmationText.set('');
    }
  }

  // 🔹 Controle dos Modais
  openDeleteConfirmation(): void {
    this.showDeleteModal.set(true);
    // Focar no input quando o modal abrir
    setTimeout(() => {
      if (this.confirmInput) {
        this.confirmInput.nativeElement.focus();
      }
    }, 100);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.confirmationText.set('');
  }

  closeExportModal(): void {
    this.showExportModal.set(false);
  }

  // 🔹 Validações
  canDeleteAccount(): boolean {
    return this.confirmationText() === this.requiredText && !this.isDeleting();
  }

  // 🔹 Simular Download
  simulateDownload(): void {
    // Em produção, isso seria um arquivo real
    const data = {
      message: "Seus dados foram exportados com sucesso!",
      timestamp: new Date().toISOString(),
      includedData: [
        "Perfil do usuário",
        "Histórico de pedidos",
        "Endereços cadastrados",
        "Métodos de pagamento",
        "Preferências e configurações",
        "Histórico de atividades"
      ]
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Criar link de download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `meus-dados-${new Date().getTime()}.json`;
    link.click();

    this.closeExportModal();
  }

  // 🔹 Estatísticas (para contexto)
  getAccountStats() {
    // Dados simulados - em produção viriam do backend
    return {
      totalOrders: 15,
      accountAge: '2 anos',
      wishlistItems: 8,
      addresses: 3
    };
  }
}