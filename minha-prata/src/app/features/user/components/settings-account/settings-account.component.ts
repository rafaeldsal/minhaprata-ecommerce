import { Component, Input, OnInit, signal } from '@angular/core';
import { UserDataService } from '../../../../core/services/data/user-data.service';
import { UserSettings } from '../../../../core/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings-account',
  templateUrl: './settings-account.component.html',
  styleUrls: ['./settings-account.component.scss']
})
export class SettingsAccountComponent implements OnInit {
  @Input() settings: UserSettings | null = null;

  accountForm: FormGroup;
  isLoading = signal(false);
  isEditing = signal(false);
  showVerificationModal = signal(false);
  verificationType = signal<'email' | 'phone'>('email');

  constructor(
    private fb: FormBuilder,
    private userDataService: UserDataService
  ) {
    this.accountForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      twoFactorEnabled: [false]
    });
  }

  private populateForm(): void {
    if (this.settings?.account) {
      this.accountForm.patchValue({
        email: this.settings.account.email,
        phone: this.settings.account.phone || '',
        twoFactorEnabled: this.settings.account.twoFactorEnabled
      });

      // Desabilitar campos inicialmente
      if (!this.isEditing()) {
        this.accountForm.get('email')?.disable();
        this.accountForm.get('phone')?.disable();
      }
    }
  }

  enableEditing(): void {
    this.isEditing.set(true);
    this.accountForm.get('email')?.enable();
    this.accountForm.get('phone')?.enable();
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.populateForm();
  }

  async saveChanges(): Promise<void> {
    if (this.accountForm.valid) {
      this.isLoading.set(true);

      try {
        await this.userDataService.updateAccountSettings(this.accountForm.value).toPromise();
        this.isEditing.set(false);
        // Feedback de sucesso
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  requestVerification(type: 'email' | 'phone'): void {
    this.verificationType.set(type);
    this.showVerificationModal.set(true);
    // Simular envio de código
    setTimeout(() => {
      this.showVerificationModal.set(false);
      // Em uma implementação real, aqui viria a lógica de verificação
    }, 2000);
  }

  toggleTwoFactor(): void {
    const currentValue = this.accountForm.get('twoFactorEnabled')?.value;
    this.accountForm.get('twoFactorEnabled')?.setValue(!currentValue);
    this.saveChanges();
  }
}