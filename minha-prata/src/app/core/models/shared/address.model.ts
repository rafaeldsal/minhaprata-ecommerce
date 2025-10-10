export interface UserAddress {
  id: string;
  title: string; // 'Casa', 'Trabalho', etc
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
  recipientName?: string;
  phone?: string;
}

// 📋 MÉTODOS AUXILIARES
export class AddressHelper {
  static formatAddress(address: UserAddress): string {
    const parts = [
      address.street,
      address.number,
      address.complement,
      address.neighborhood,
      `${address.city} - ${address.state}`,
      this.formatCEP(address.zip_code)
    ].filter(part => part && part.trim());

    return parts.join(', ');
  }

  static formatCEP(cep: string): string {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return cep;

    return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
  }

  static isValidCEP(cep: string): boolean {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8;
  }

  static createEmptyAddress(): UserAddress {
    return {
      id: '',
      title: '',
      zip_code: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      is_default: false,
      recipientName: '',
      phone: ''
    };
  }

  static validateAddress(address: Partial<UserAddress>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address.title?.trim()) errors.push('Título do endereço é obrigatório');
    if (!address.zip_code?.trim() || !this.isValidCEP(address.zip_code)) errors.push('CEP inválido');
    if (!address.street?.trim()) errors.push('Rua é obrigatória');
    if (!address.number?.trim()) errors.push('Número é obrigatório');
    if (!address.neighborhood?.trim()) errors.push('Bairro é obrigatório');
    if (!address.city?.trim()) errors.push('Cidade é obrigatória');
    if (!address.state?.trim()) errors.push('Estado é obrigatório');
    if (!address.recipientName?.trim()) errors.push('Nome do destinatário é obrigatório');
    if (!address.phone?.trim()) errors.push('Telefone é obrigatório');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static getBrazilianStates(): Array<{ value: string; label: string }> {
    return [
      { value: 'AC', label: 'Acre' },
      { value: 'AL', label: 'Alagoas' },
      { value: 'AP', label: 'Amapá' },
      { value: 'AM', label: 'Amazonas' },
      { value: 'BA', label: 'Bahia' },
      { value: 'CE', label: 'Ceará' },
      { value: 'DF', label: 'Distrito Federal' },
      { value: 'ES', label: 'Espírito Santo' },
      { value: 'GO', label: 'Goiás' },
      { value: 'MA', label: 'Maranhão' },
      { value: 'MT', label: 'Mato Grosso' },
      { value: 'MS', label: 'Mato Grosso do Sul' },
      { value: 'MG', label: 'Minas Gerais' },
      { value: 'PA', label: 'Pará' },
      { value: 'PB', label: 'Paraíba' },
      { value: 'PR', label: 'Paraná' },
      { value: 'PE', label: 'Pernambuco' },
      { value: 'PI', label: 'Piauí' },
      { value: 'RJ', label: 'Rio de Janeiro' },
      { value: 'RN', label: 'Rio Grande do Norte' },
      { value: 'RS', label: 'Rio Grande do Sul' },
      { value: 'RO', label: 'Rondônia' },
      { value: 'RR', label: 'Roraima' },
      { value: 'SC', label: 'Santa Catarina' },
      { value: 'SP', label: 'São Paulo' },
      { value: 'SE', label: 'Sergipe' },
      { value: 'TO', label: 'Tocantins' }
    ];
  }

  static setDefaultAddress(addresses: UserAddress[], defaultAddressId: string): UserAddress[] {
    return addresses.map(address => ({
      ...address,
      is_default: address.id === defaultAddressId
    }));
  }

  static getDefaultAddress(addresses: UserAddress[]): UserAddress | undefined {
    return addresses.find(address => address.is_default);
  }
}