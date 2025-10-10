export enum CategorySlug {
  ALL = 'all',
  ANEIS = 'aneis',
  BRINCOS = 'brincos',
  BRACELETES = 'braceletes',
  COLARES = 'colares'
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: CategorySlug | string;
  icon?: string;
  productCount?: number;
}

// 📋 MÉTODOS AUXILIARES
export class CategoryHelper {
  private static categoryIcons: Record<CategorySlug, string> = {
    [CategorySlug.ANEIS]: '💍',
    [CategorySlug.BRINCOS]: '📿',
    [CategorySlug.BRACELETES]: '📿',
    [CategorySlug.COLARES]: '📿',
    [CategorySlug.ALL]: '📦'
  };

  static getIconBySlug(slug: CategorySlug): string {
    return this.categoryIcons[slug] || '📦';
  }

  static getCategoryBySlug(categories: Category[], slug: string): Category | undefined {
    return categories.find(cat => cat.slug === slug || cat.name.toLowerCase() === slug.toLowerCase());
  }

  static getDisplayName(category: Category): string {
    return category.name.charAt(0).toUpperCase() + category.name.slice(1);
  }

  static isValidCategory(category: Partial<Category>): boolean {
    return !!(category.name && category.description);
  }

  static getDefaultCategories(): Category[] {
    return [
      { id: '1', name: 'aneis', description: 'Anéis em prata', slug: CategorySlug.ANEIS, icon: '💍' },
      { id: '2', name: 'braceletes', description: 'Braceletes em prata', slug: CategorySlug.BRACELETES, icon: '📿' },
      { id: '3', name: 'colares', description: 'Colares em prata', slug: CategorySlug.COLARES, icon: '📿' },
      { id: '4', name: 'brincos', description: 'Brincos em prata', slug: CategorySlug.BRINCOS, icon: '📿' }
    ];
  }
}