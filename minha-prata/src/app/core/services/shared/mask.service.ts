import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MaskService {

  constructor() { }

  // Máscara de CPF
  cpfMask(value: string): string {
    if (!value) return '';

    value = value.replace(/\D/g, '');

    if (value.length <= 3) {
      return value;
    } else if (value.length <= 6) {
      return value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else if (value.length <= 9) {
      return value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }
  }

  // Máscara de telefone
  phoneMask(value: string): string {
    if (!value) return '';

    value = value.replace(/\D/g, '');

    if (value.length <= 10) {
      return value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  }

  // Máscara de CEP
  cepMask(value: string): string {
    if (!value) return '';

    value = value.replace(/\D/g, '');

    if (value.length <= 5) {
      return value;
    } else {
      return value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
  }

  // Remove máscara
  unmask(value: string): string {
    return value ? value.replace(/\D/g, '') : '';
  }

  // Aplica máscara baseada no tipo
  applyMask(value: string, type: 'cpf' | 'phone' | 'cep'): string {
    switch (type) {
      case 'cpf':
        return this.cpfMask(value);
      case 'phone':
        return this.phoneMask(value);
      case 'cep':
        return this.cepMask(value);
      default:
        return value;
    }
  }
}