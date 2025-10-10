import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, UserAddress, UpdateProfileData, ChangePasswordData } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/shared/notification.service';
import { MaskService } from '../../../../core/services/shared/mask.service';
import { UserDataService } from 'src/app/core/services/data/user-data.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  currentUser: User | null = null;
  isEditing = false;
  isChangingPassword = false;
  isLoading = false;
  userAddresses: UserAddress[] = [];
  selectedAddress: UserAddress | null = null;
  isEditingAddress = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  addressForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private userDataService: UserDataService,
    private maskService: MaskService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
    this.loadAddresses();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.isChangingPassword) {
      this.cancelPasswordChange();
    }
  }

  private initForms(): void {
    // Formulário de perfil
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required]],
      dt_birth: ['', [Validators.required]],
      notifications_enabled: [true]
    });

    // Formulário de senha
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required, Validators.minLength(6)]],
      new_password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirm_password: ['', [Validators.required]]
    }, { validators: [this.passwordMatchValidator, this.passwordStrengthValidator] });

    // Formulário de endereço
    this.addressForm = this.fb.group({
      title: ['', [Validators.required]],
      zip_code: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      complement: [''],
      neighborhood: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      is_default: [false]
    });
  }

  private passwordStrengthValidator(form: FormGroup) {
    const newPassword = form.get('new_password');

    if (!newPassword || !newPassword.value) return null;

    const value = newPassword.value;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      newPassword.setErrors({ passwordStrength: true });
    } else {
      const errors = newPassword.errors;
      if (errors) {
        delete errors['passwordStrength'];
        newPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('new_password');
    const confirmPassword = form.get('confirm_password');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  private loadUserData(): void {
    this.authService.authState$.subscribe(authState => {
      this.currentUser = authState.user;
      if (this.currentUser && this.profileForm) {
        this.populateForm();
      }
    });
  }

  private populateForm(): void {
    if (!this.currentUser) return;

    this.profileForm.patchValue({
      name: this.currentUser.name,
      email: this.currentUser.email,
      phone_number: this.currentUser.phone_number,
      dt_birth: this.currentUser.dt_birth,
      notifications_enabled: this.currentUser.notifications_enabled ?? true
    });
  }

  private loadAddresses(): void {
    if (!this.currentUser) return;

    this.userDataService.getAddresses(this.currentUser.id).subscribe({
      next: (addresses) => {
        this.userAddresses = addresses;
      },
      error: (error) => {
        console.error('Erro ao carregar endereços:', error);
        this.notificationService.showError('Erro ao carregar endereços');
      }
    });
  }

  // === MÉTODOS DE TOGGLE DE SENHA ===
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  // Método para obter o tipo de input baseado no estado de visibilidade
  getPasswordInputType(field: 'current' | 'new' | 'confirm'): string {
    switch (field) {
      case 'current':
        return this.showCurrentPassword ? 'text' : 'password';
      case 'new':
        return this.showNewPassword ? 'text' : 'password';
      case 'confirm':
        return this.showConfirmPassword ? 'text' : 'password';
      default:
        return 'password';
    }
  }

  // === MÉTODOS DE PERFIL ===
  startEditing(): void {
    this.isEditing = true;
    this.populateForm();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.profileForm.reset();
    this.populateForm();
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.currentUser) return;

    this.isLoading = true;
    const formData: UpdateProfileData = this.profileForm.value;

    this.userDataService.updateProfile(this.currentUser.id, formData).subscribe({
      next: (updatedUser) => {
        this.isLoading = false;
        this.isEditing = false;

        // Atualiza o usuário no AuthService
        this.authService.updateUserProfile(updatedUser);

        this.notificationService.showSuccess('Perfil atualizado com sucesso!');
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError('Erro ao atualizar perfil');
      }
    });
  }

  // === MÉTODOS DE SENHA ===
  isGoogleUser(): boolean {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.provider === 'google';
      } catch {
        return false;
      }
    }
    return false;
  }

  startPasswordChange(): void {
    if (this.isGoogleUser()) {
      this.notificationService.showInfo('Usuários que fizeram login com Google gerenciam a senha diretamente na conta do Google.');
      return;
    }

    this.isChangingPassword = true;
    this.passwordForm.reset();

    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordForm.reset();

    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || !this.currentUser) return;

    this.isLoading = true;
    const passwordData: ChangePasswordData = this.passwordForm.value;

    this.userDataService.changePassword(this.currentUser.id, passwordData).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success) {
          this.isChangingPassword = false;
          this.passwordForm.reset();
          this.notificationService.showSuccess(response.message);
        } else {
          this.notificationService.showError(response.message);
          this.passwordForm.patchValue({ current_password: '' });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError('Erro ao alterar senha. Tente novamente.');
        this.passwordForm.patchValue({ current_password: '' });
      }
    });
  }

  // === MÉTODOS DE AVATAR ===
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.currentUser) return;

    if (!file.type.startsWith('image/')) {
      this.notificationService.showError('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.showError('A imagem deve ter no máximo 5MB');
      return;
    }

    this.isLoading = true;
    this.userDataService.updateAvatar(this.currentUser.id, file).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (this.currentUser) {
          this.currentUser.avatar = response.avatarUrl;
          this.authService.updateUserProfile(this.currentUser);
        }

        this.notificationService.showSuccess('Avatar atualizado com sucesso!');
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError('Erro ao atualizar avatar');
      }
    });
  }

  // === MÉTODOS DE ENDEREÇO ===
  addNewAddress(): void {
    this.selectedAddress = null;
    this.isEditingAddress = true;
    this.addressForm.reset({ is_default: false });
  }

  editAddress(address: UserAddress): void {
    this.selectedAddress = address;
    this.isEditingAddress = true;
    this.addressForm.patchValue(address);
  }

  cancelAddressEdit(): void {
    this.isEditingAddress = false;
    this.selectedAddress = null;
    this.addressForm.reset();
  }

  onSaveAddress(): void {
    if (this.addressForm.invalid || !this.currentUser) return;

    this.isLoading = true;
    const addressData: UserAddress = this.addressForm.value;

    if (this.selectedAddress) {
      this.userDataService.updateAddress(
        this.currentUser.id,
        this.selectedAddress.id!,
        addressData
      ).subscribe({
        next: (updatedAddress) => {
          this.handleAddressSuccess('Endereço atualizado com sucesso!');
          this.updateAddressInList(updatedAddress);
        },
        error: (error) => this.handleAddressError('Erro ao atualizar endereço')
      });
    } else {
      this.userDataService.addAddress(this.currentUser.id, addressData).subscribe({
        next: (newAddress) => {
          this.handleAddressSuccess('Endereço adicionado com sucesso!');
          this.userAddresses.push(newAddress);
        },
        error: (error) => this.handleAddressError('Erro ao adicionar endereço')
      });
    }
  }

  private handleAddressSuccess(message: string): void {
    this.isLoading = false;
    this.isEditingAddress = false;
    this.selectedAddress = null;
    this.addressForm.reset();
    this.notificationService.showSuccess(message);
  }

  private handleAddressError(message: string): void {
    this.isLoading = false;
    this.handleError(message);
  }

  private updateAddressInList(updatedAddress: UserAddress): void {
    const index = this.userAddresses.findIndex(addr => addr.id === updatedAddress.id);
    if (index !== -1) {
      this.userAddresses[index] = updatedAddress;
    }
  }

  deleteAddress(address: UserAddress): void {
    if (!this.currentUser || !address.id) return;

    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      this.userDataService.deleteAddress(this.currentUser.id, address.id).subscribe({
        next: (response) => {
          this.userAddresses = this.userAddresses.filter(addr => addr.id !== address.id);
          this.notificationService.showSuccess(response.message);
        },
        error: (error) => {
          this.handleError('Erro ao excluir endereço');
        }
      });
    }
  }

  setDefaultAddress(address: UserAddress): void {
    if (!this.currentUser || !address.id) return;

    this.userDataService.setDefaultAddress(this.currentUser.id, address.id).subscribe({
      next: (addresses) => {
        this.userAddresses = addresses;
        this.notificationService.showSuccess('Endereço padrão definido com sucesso!');
      },
      error: (error) => {
        this.handleError('Erro ao definir endereço padrão');
      }
    });
  }

  // === UTILITÁRIOS ===
  formatBirthDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  handleError(message: string): void {
    this.notificationService.showError(message);
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo é obrigatório';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return 'Formato inválido';
      if (field.errors['passwordMismatch']) return 'As senhas não coincidem';
      if (field.errors['passwordStrength']) return 'A senha deve conter letras maiúsculas, minúsculas e números';
    }
    return '';
  }

  onPhoneInput(event: any): void {
    const maskedValue = this.maskService.phoneMask(event.target.value);
    this.profileForm.patchValue({ phone_number: maskedValue });
  }

  onCepInput(event: any): void {
    const maskedValue = this.maskService.cepMask(event.target.value);
    this.addressForm.patchValue({ zip_code: maskedValue });
  }

  getMaskedCpf(cpf: string): string {
    return this.maskService.cpfMask(cpf);
  }

  getMaskedPhone(phone: string): string {
    return this.maskService.phoneMask(phone);
  }

  getMaskedCep(cep: string): string {
    return this.maskService.cepMask(cep);
  }

  // === MÉTODOS PARA FORÇA DA SENHA ===
  getPasswordStrength(): string {
    const password = this.passwordForm?.get('new_password')?.value;
    if (!password) return '';

    const strength = this.calculatePasswordStrength(password);
    if (strength < 3) return 'weak';
    if (strength < 5) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Senha fraca';
      case 'medium': return 'Senha média';
      case 'strong': return 'Senha forte';
      default: return '';
    }
  }

  private calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    if (password.length >= 8) strength++;
    return strength;
  }

  hasUpperCase(): boolean {
    const password = this.passwordForm?.get('new_password')?.value;
    return password && /[A-Z]/.test(password);
  }

  hasLowerCase(): boolean {
    const password = this.passwordForm?.get('new_password')?.value;
    return password && /[a-z]/.test(password);
  }

  hasNumbers(): boolean {
    const password = this.passwordForm?.get('new_password')?.value;
    return password && /\d/.test(password);
  }

  hasMinLength(): boolean {
    const password = this.passwordForm?.get('new_password')?.value;
    return password && password.length >= 6;
  }
}