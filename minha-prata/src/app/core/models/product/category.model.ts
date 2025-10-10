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
  icon?: string; // Agora será classe do Font Awesome
  parentId?: string;
  isActive: boolean;
  productCount?: number;
  children?: Category[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  icon: string;
  parentId?: string;
  isActive: boolean;
}

export interface CategoryFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  parent: string;
}

export interface BulkCategoryAction {
  type: 'activate' | 'deactivate' | 'delete';
  categoryIds: string[];
}

export interface CategoryReorder {
  categoryId: string;
  newOrder: number;
  parentId?: string;
}

// 📋 MÉTODOS AUXILIARES
export class CategoryHelper {
  private static categoryIcons: Record<CategorySlug, string> = {
    [CategorySlug.ANEIS]: 'fa-regular fa-gem',
    [CategorySlug.BRINCOS]: 'fa-solid fa-ring',
    [CategorySlug.BRACELETES]: 'fa-solid fa-hands-bubbles',
    [CategorySlug.COLARES]: 'fa-solid fa-medal',
    [CategorySlug.ALL]: 'fa-solid fa-box'
  };

  static getIconBySlug(slug: CategorySlug): string {
    return this.categoryIcons[slug] || 'fa-solid fa-box';
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
    const now = new Date();
    return [
      {
        id: '1',
        name: 'Anéis',
        description: 'Anéis em prata 925',
        slug: CategorySlug.ANEIS,
        icon: 'fa-regular fa-gem',
        parentId: undefined,
        isActive: true,
        productCount: 15,
        order: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: '2',
        name: 'Braceletes',
        description: 'Braceletes em prata',
        slug: CategorySlug.BRACELETES,
        icon: 'fa-solid fa-hands-bubbles',
        parentId: undefined,
        isActive: true,
        productCount: 8,
        order: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        id: '3',
        name: 'Colares',
        description: 'Colares em prata',
        slug: CategorySlug.COLARES,
        icon: 'fa-solid fa-medal',
        parentId: undefined,
        isActive: true,
        productCount: 12,
        order: 3,
        createdAt: now,
        updatedAt: now
      },
      {
        id: '4',
        name: 'Brincos',
        description: 'Brincos em prata',
        slug: CategorySlug.BRINCOS,
        icon: 'fa-solid fa-ring',
        parentId: undefined,
        isActive: true,
        productCount: 20,
        order: 4,
        createdAt: now,
        updatedAt: now
      }
    ];
  }

  // Novos métodos para hierarquia
  static buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>();
    const roots: Category[] = [];

    // Primeiro, mapeia todas as categorias
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Depois, constrói a hierarquia
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId)!;
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    // Ordena por ordem
    return this.sortCategories(roots);
  }

  static sortCategories(categories: Category[]): Category[] {
    return categories
      .sort((a, b) => a.order - b.order)
      .map(category => ({
        ...category,
        children: category.children ? this.sortCategories(category.children) : []
      }));
  }

  static flattenCategoryTree(categories: Category[]): Category[] {
    const result: Category[] = [];

    const flatten = (nodes: Category[], level: number = 0) => {
      nodes.forEach(node => {
        result.push({
          ...node,
          name: '  '.repeat(level) + node.name
        });
        if (node.children && node.children.length > 0) {
          flatten(node.children, level + 1);
        }
      });
    };

    flatten(categories);
    return result;
  }

  static validateCategoryForm(data: CategoryFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Nome da categoria é obrigatório');
    if (!data.description?.trim()) errors.push('Descrição é obrigatória');
    if (!data.slug?.trim()) errors.push('Slug é obrigatório');
    if (!data.icon?.trim()) errors.push('Ícone é obrigatório');

    if (data.name && data.name.length > 50) errors.push('Nome deve ter no máximo 50 caracteres');
    if (data.description && data.description.length > 200) errors.push('Descrição deve ter no máximo 200 caracteres');

    // Validação de slug
    const slugRegex = /^[a-z0-9-]+$/;
    if (data.slug && !slugRegex.test(data.slug)) {
      errors.push('Slug deve conter apenas letras minúsculas, números e hífens');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  static getCategoryIconOptions(): { value: string; label: string }[] {
    return [
      { value: 'fa-regular fa-gem', label: '💎 Gema' },
      { value: 'fa-solid fa-ring', label: '💍 Anel' },
      { value: 'fa-solid fa-hands-bubbles', label: '✨ Bracelete' },
      { value: 'fa-solid fa-medal', label: '🏅 Medalha' },
      { value: 'fa-solid fa-wristwatch', label: '⌚ Pulseira' },
      { value: 'fa-solid fa-ankh', label: '☥ Tornozeleira' },
      { value: 'fa-solid fa-crown', label: '👑 Coroa' },
      { value: 'fa-solid fa-star', label: '⭐ Estrela' },
      { value: 'fa-solid fa-heart', label: '❤️ Coração' },
      { value: 'fa-solid fa-moon', label: '🌙 Lua' },
      { value: 'fa-solid fa-sun', label: '☀️ Sol' },
      { value: 'fa-solid fa-cloud', label: '☁️ Nuvem' },
      { value: 'fa-solid fa-flower', label: '🌺 Flor' },
      { value: 'fa-solid fa-bolt', label: '⚡ Raio' },
      { value: 'fa-solid fa-feather', label: '🪶 Pena' }
    ];
  }

  static getIconLabel(iconClass: string): string {
    const options = this.getCategoryIconOptions();
    const option = options.find(opt => opt.value === iconClass);
    return option ? option.label : '📦 Caixa';
  }
}