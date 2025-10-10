import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserSettings } from '../../../../core/models';
import { UserDataService } from 'src/app/core/services/data/user-data.service';

@Component({
  selector: 'app-settings-privacy',
  templateUrl: './settings-privacy.component.html',
  styleUrls: ['./settings-privacy.component.scss']
})
export class SettingsPrivacyComponent implements OnInit {
  @Input() settings: UserSettings | null = null;

  privacyForm: FormGroup;
  isLoading = signal(false);
  lastSaved = signal<Date | null>(null);

  constructor(
    private fb: FormBuilder,
    private userDataService: UserDataService
  ) {
    this.privacyForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();

    // Salvar automaticamente quando o formulário muda
    this.privacyForm.valueChanges.subscribe(() => {
      this.debouncedSave();
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Privacidade de Dados Pessoais
      showPurchaseHistory: [true],
      showWishlist: [false],
      hideOrderPrices: [false],

      // Marketing e Comunicações
      personalizedRecommendations: [true],
      priceDropNotifications: [true],
      abandonedCartReminders: [true],
      productReviewReminders: [true],

      // Compartilhamento de Dados
      dataSharing: [false],
      thirdPartyMarketing: [false],
      browserTracking: [true],

      // Segurança
      savePaymentMethods: [true],
      quickCheckout: [false],
      orderTrackingAlerts: [true]
    });
  }

  private populateForm(): void {
    if (this.settings?.privacy) {
      this.privacyForm.patchValue(this.settings.privacy, { emitEvent: false });
    }
  }

  private debounceTimer: any;
  private debouncedSave(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.saveChanges();
    }, 1000);
  }

  async saveChanges(): Promise<void> {
    if (this.privacyForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      try {
        await this.userDataService.updatePrivacySettings(this.privacyForm.value).toPromise();
        this.lastSaved.set(new Date());
      } catch (error) {
        console.error('Erro ao salvar configurações de privacidade:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  resetToDefaults(): void {
    if (confirm('Restaurar todas as configurações de privacidade para os padrões?')) {
      this.privacyForm.patchValue({
        showPurchaseHistory: true,
        showWishlist: false,
        hideOrderPrices: false,
        personalizedRecommendations: true,
        priceDropNotifications: true,
        abandonedCartReminders: true,
        productReviewReminders: true,
        dataSharing: false,
        thirdPartyMarketing: false,
        browserTracking: true,
        savePaymentMethods: true,
        quickCheckout: false,
        orderTrackingAlerts: true
      });
    }
  }

  // Métodos auxiliares para descrições
  getRecommendationDescription(): string {
    return this.privacyForm.get('personalizedRecommendations')?.value
      ? 'Recomendações baseadas no seu histórico de compras e navegação'
      : 'Recomendações genéricas mostradas';
  }
}