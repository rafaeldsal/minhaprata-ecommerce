import { ProductFormData, ProductOption } from './product.model';

export interface ProductFilters {
  search: string;
  category: string;
  status: 'active' | 'out_of_stock' | 'all';
  priceRange: {
    min: number;
    max: number;
  };
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all';
}

export interface BulkAction {
  type: 'activate' | 'deactivate' | 'delete';
  productIds: string[];
}

// 📋 MÉTODOS AUXILIARES
export class ProductAdminHelper {
  static getDefaultFilters(): ProductFilters {
    return {
      search: '',
      category: '',
      status: 'all',
      priceRange: { min: 0, max: 1000 },
      stockStatus: 'all'
    };
  }

  static applyFilters(products: any[], filters: ProductFilters): any[] {
    return products.filter(product => {
      const matchesSearch = !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory = !filters.category || product.category.id === filters.category;
      const matchesStatus = !filters.status || filters.status === 'all' ||
        (filters.status === 'out_of_stock' ? product.stockQuantity === 0 : product.stockQuantity > 0);

      const matchesPrice = (!filters.priceRange.min || product.price >= filters.priceRange.min) &&
        (!filters.priceRange.max || product.price <= filters.priceRange.max);

      const matchesStock = this.matchesStockStatus(product, filters.stockStatus);

      return matchesSearch && matchesCategory && matchesStatus &&
        matchesPrice && matchesStock;
    });
  }

  private static matchesStockStatus(product: any, status: string): boolean {
    if (status === 'all') return true;
    if (status === 'in_stock') return product.stockQuantity > 10;
    if (status === 'low_stock') return product.stockQuantity > 0 && product.stockQuantity <= 10;
    if (status === 'out_of_stock') return product.stockQuantity === 0;
    return true;
  }

  static getBulkActionText(action: BulkAction['type']): string {
    const actions = {
      activate: 'ativar',
      deactivate: 'desativar',
      delete: 'excluir'
    };
    return actions[action] || action;
  }

  static validateProductForm(data: ProductFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Nome do produto é obrigatório');
    if (!data.description?.trim()) errors.push('Descrição é obrigatória');
    if (!data.price || data.price <= 0) errors.push('Preço deve ser maior que zero');
    if (!data.imgUrl?.trim()) errors.push('Imagem principal é obrigatória');
    if (data.stockQuantity < 0) errors.push('Estoque não pode ser negativo');
    if (!data.category) errors.push('Categoria é obrigatória');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}