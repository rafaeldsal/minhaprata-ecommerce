import { Category } from './category.model';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  images?: string[];
  stockQuantity: number;
  dtCreated: string;
  dtUpdated: string;
  category: Category;
  options?: ProductOption[];
  inStock?: boolean;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  images?: string[];
  stockQuantity: number;
  category: string; // ID da categoria
  options?: ProductOption[];
}

// 📋 CONSTANTES E CONFIGURAÇÕES
export const PRODUCT_OPTIONS_BY_CATEGORY: {
  [key: string]: ProductOption[]
} = {
  aneis: [
    {
      name: 'Tamanho',
      values: ['16', '17', '18', '19']
    },
    {
      name: 'Material',
      values: ['Prata 925', 'Prata Banhada', 'Prata com Safira']
    }
  ],
  braceletes: [
    {
      name: 'Tamanho',
      values: ['Pequeno', 'Médio', 'Grande']
    },
    {
      name: 'Fecho',
      values: ['Imã', 'Elástico', 'Fivela']
    }
  ],
  colares: [
    {
      name: 'Comprimento',
      values: ['40cm', '45cm', '50cm', '55cm', '60cm']
    },
    {
      name: 'Tipo de Corrente',
      values: ['Figaro', 'Cobra', 'Box', 'Anel']
    }
  ],
  brincos: [
    {
      name: 'Tipo',
      values: ['Argola', 'Pino', 'Pérola', 'Stud', 'Pendente']
    },
    {
      name: 'Tamanho',
      values: ['Pequeno', 'Médio', 'Grande']
    }
  ]
};

// 📋 MÉTODOS AUXILIARES
export class ProductHelper {
  static getProductImages(product: Product): string[] {
    // Prioridade 1: Array images
    if (product.images && product.images.length > 0) {
      return product.images;
    }

    // Prioridade 2: imgUrl splitada (fallback temporário)
    if (product.imgUrl && product.imgUrl.includes(';')) {
      return product.imgUrl.split(';').filter(url => url.trim());
    }

    // Prioridade 3: imgUrl única
    return [product.imgUrl];
  }

  static getMainImage(product: Product): string {
    const images = this.getProductImages(product);
    return images[0] || product.imgUrl || '/assets/images/placeholder-product.jpg';
  }

  static isInStock(product: Product): boolean {
    return product.stockQuantity > 0;
  }

  static getStockStatus(product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (product.stockQuantity === 0) return 'out_of_stock';
    if (product.stockQuantity <= 10) return 'low_stock';
    return 'in_stock';
  }

  static getStockStatusText(product: Product): string {
    const status = this.getStockStatus(product);
    const statusMap = {
      in_stock: 'Em estoque',
      low_stock: 'Estoque baixo',
      out_of_stock: 'Sem estoque'
    };
    return statusMap[status];
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  static calculateDiscount(originalPrice: number, currentPrice: number): number {
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  static isValidProduct(product: Partial<Product>): boolean {
    return !!(product.name && product.description && product.price && product.category);
  }

  static sortByPrice(products: Product[], ascending: boolean = true): Product[] {
    return [...products].sort((a, b) =>
      ascending ? a.price - b.price : b.price - a.price
    );
  }

  static filterByCategory(products: Product[], categoryId: string): Product[] {
    if (!categoryId) return products;
    return products.filter(product => product.category.id === categoryId);
  }

  static searchProducts(products: Product[], searchTerm: string): Product[] {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.name.toLowerCase().includes(term)
    );
  }

  // 📋 NOVOS MÉTODOS PARA OPÇÕES DE PRODUTO
  static getOptionsForCategory(categorySlug: string): ProductOption[] {
    return PRODUCT_OPTIONS_BY_CATEGORY[categorySlug] || [];
  }

  static getOptionsForProduct(product: Product): ProductOption[] {
    // Prioridade 1: Opções específicas do produto
    if (product.options && product.options.length > 0) {
      return product.options;
    }

    // Prioridade 2: Opções padrão da categoria
    const categorySlug = product.category.slug || product.category.name.toLowerCase();
    return this.getOptionsForCategory(categorySlug);
  }

  static hasOptions(product: Product): boolean {
    return this.getOptionsForProduct(product).length > 0;
  }

  static getDefaultSelectedOptions(product: Product): { [key: string]: string } {
    const options = this.getOptionsForProduct(product);
    const selected: { [key: string]: string } = {};

    options.forEach(option => {
      if (option.values.length > 0) {
        selected[option.name] = option.values[0];
      }
    });

    return selected;
  }

  static validateSelectedOptions(
    product: Product,
    selectedOptions: { [key: string]: string }
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const availableOptions = this.getOptionsForProduct(product);

    availableOptions.forEach(option => {
      const selectedValue = selectedOptions[option.name];

      if (!selectedValue) {
        errors.push(`Opção "${option.name}" é obrigatória`);
      } else if (!option.values.includes(selectedValue)) {
        errors.push(`Valor "${selectedValue}" não é válido para "${option.name}"`);
      }
    });

    // Verificar opções extras não permitidas
    Object.keys(selectedOptions).forEach(selectedKey => {
      const hasOption = availableOptions.some(option => option.name === selectedKey);
      if (!hasOption) {
        errors.push(`Opção "${selectedKey}" não está disponível para este produto`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static generateProductVariantName(
    product: Product,
    selectedOptions: { [key: string]: string }
  ): string {
    const optionValues = Object.values(selectedOptions);
    if (optionValues.length === 0) return product.name;

    return `${product.name} - ${optionValues.join(', ')}`;
  }

  static getAvailableOptionValues(product: Product, optionName: string): string[] {
    const options = this.getOptionsForProduct(product);
    const option = options.find(opt => opt.name === optionName);
    return option ? option.values : [];
  }

  static isOptionAvailable(
    product: Product,
    optionName: string,
    value: string
  ): boolean {
    const availableValues = this.getAvailableOptionValues(product, optionName);
    return availableValues.includes(value);
  }
}