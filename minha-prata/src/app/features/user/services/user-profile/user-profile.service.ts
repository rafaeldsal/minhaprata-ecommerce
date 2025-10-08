import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChangePasswordData, UpdateProfileData, User, UserAddress, UserRole } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) { }

  // NO FUTURO: Integração com API real
  updateProfile(userId: string, data: UpdateProfileData): Observable<User> {
    // Mock por enquanto - depois substituir pela API real
    console.log('📤 Atualizando perfil:', data);
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
    });
  }

  updateAvatar(userId: string, avatarFile: File): Observable<{ avatarUrl: string }> {
    // Mock por enquanto - simular upload
    console.log('🖼 Upload de avatar:', avatarFile.name);
    return of({
      avatarUrl: 'https://via.placeholder.com/150'
    });
  }

  // Gerenciamento de endereços
  getAddresses(userId: string): Observable<UserAddress[]> {
    // Mock data - depois API real
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
        is_default: true
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
        is_default: false
      }
    ];
    return of(mockAddresses);
  }

  addAddress(userId: string, address: UserAddress): Observable<UserAddress> {
    console.log('🏠 Adicionando endereço:', address);
    return of({ ...address, id: Date.now().toString() });
  }

  updateAddress(userId: string, addressId: string, address: UserAddress): Observable<UserAddress> {
    console.log('✏️ Atualizando endereço:', addressId, address);
    return of({ ...address, id: addressId });
  }

  deleteAddress(userId: string, addressId: string): Observable<{ message: string }> {
    console.log('🗑️ Removendo endereço:', addressId);
    return of({ message: 'Endereço removido com sucesso' });
  }

  setDefaultAddress(userId: string, addressId: string): Observable<UserAddress[]> {
    console.log('⭐ Definindo endereço padrão:', addressId);
    return this.getAddresses(userId); // Retorna lista atualizada
  }

  changePassword(userId: string, data: ChangePasswordData): Observable<{ success: boolean; message: string }> {
    console.log('🔐 Alterando senha para usuário:', userId, data);

    // Para usuários que fizeram login com Google, não permitir alterar senha
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

  private getCurrentUserFromStorage(): any {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

}
