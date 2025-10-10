// src/app/core/services/data/product-data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, of } from 'rxjs';
import { Product, ProductFormData, ProductHelper, ProductOption } from '../../models/product/product.model';
import { Category, CategoryHelper, CategorySlug } from '../../models/product/category.model';
import { ProductFilters, BulkAction, ProductAdminHelper } from '../../models/product/product-admin.model';
import { NotificationService } from '../shared/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {
  private readonly PRODUCTS_STORAGE_KEY = 'minhaprata_products';
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(
    private notificationService: NotificationService
  ) {
    this.initializeProducts();
  }

  // ========== 🛍️ MÉTODOS PÚBLICOS - CLIENTE ==========

  /**
   * Obtém todos os produtos
   */
  getProducts(): Observable<Product[]> {
    const enhancedProducts = this.enhanceProductsWithOptions(this.productsSubject.value);

    console.log('📦 Buscando todos os produtos...');
    return of(enhancedProducts).pipe(delay(1000));
  }

  /**
   * Obtém produtos por categoria
   */
  getProductsByCategory(categorySlug: string): Observable<Product[]> {
    if (categorySlug === 'all') {
      return this.getProducts();
    }

    const filtered = ProductHelper.filterByCategory(
      this.productsSubject.value,
      this.getCategoryIdBySlug(categorySlug)
    );

    const enhancedProducts = this.enhanceProductsWithOptions(filtered);

    console.log(`📦 Buscando produtos da categoria: ${categorySlug}`);
    return of(enhancedProducts).pipe(delay(800));
  }

  /**
   * Obtém produto por ID
   */
  getProductById(id: string): Observable<Product | undefined> {
    const product = this.productsSubject.value.find(p => p.id === id);

    if (product) {
      console.log(`📦 Buscando produto: ${product.name}`);
      const enhancedProduct = this.enhanceProductWithOptions(product);
      return of(enhancedProduct);
    }

    this.notificationService.showWarning(`Produto com ID ${id} não encontrado`);
    return of(undefined);
  }

  /**
   * Busca produtos por termo
   */
  searchProducts(searchTerm: string): Observable<Product[]> {
    if (!searchTerm.trim()) {
      return this.getProducts();
    }

    const filtered = ProductHelper.searchProducts(this.productsSubject.value, searchTerm);
    const enhancedProducts = this.enhanceProductsWithOptions(filtered);

    if (filtered.length === 0) {
      this.notificationService.showInfo(`Nenhum produto encontrado para "${searchTerm}"`);
    } else {
      console.log(`🔍 Encontrados ${filtered.length} produtos para "${searchTerm}"`);
    }

    return of(enhancedProducts);
  }

  /**
   * Obtém produtos em destaque
   */
  getFeaturedProducts(): Observable<Product[]> {
    const featured = this.productsSubject.value
      .filter(product => product.stockQuantity > 5)
      .slice(0, 6); // Limita a 6 produtos

    const enhancedProducts = this.enhanceProductsWithOptions(featured);
    return of(enhancedProducts).pipe(delay(600));
  }

  // ========== ⚙️ MÉTODOS PÚBLICOS - ADMIN ==========

  /**
   * Obtém produtos com filtros avançados (admin)
   */
  getProductsWithFilters(
    filters: ProductFilters,
    page: number = 1,
    pageSize: number = 10
  ): Observable<{ products: Product[], total: number }> {
    return this.products$.pipe(
      map(products => {
        let filtered = ProductAdminHelper.applyFilters(products, filters);
        const total = filtered.length;
        const startIndex = (page - 1) * pageSize;
        const paginated = filtered.slice(startIndex, startIndex + pageSize);

        return {
          products: this.enhanceProductsWithOptions(paginated),
          total
        };
      }),
      delay(500)
    );
  }

  /**
   * Cria novo produto
   */
  createProduct(productData: ProductFormData): Observable<Product> {
    const validation = ProductAdminHelper.validateProductForm(productData);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    const newProduct: Product = {
      id: this.generateProductId(),
      name: productData.name,
      description: productData.description,
      price: productData.price,
      imgUrl: productData.imgUrl,
      images: productData.images || [productData.imgUrl],
      stockQuantity: productData.stockQuantity,
      dtCreated: new Date().toISOString(),
      dtUpdated: new Date().toISOString(),
      category: this.getCategoryById(productData.category),
      options: productData.options || [],
      inStock: productData.stockQuantity > 0
    };

    const current = this.productsSubject.value;
    const updatedProducts = [...current, newProduct];
    this.productsSubject.next(updatedProducts);
    this.saveProductsToStorage();

    this.notificationService.showSuccess('Produto criado com sucesso!');
    return of(newProduct).pipe(delay(800));
  }

  /**
   * Atualiza produto existente
   */
  updateProduct(id: string, updates: ProductFormData): Observable<Product> {
    const validation = ProductAdminHelper.validateProductForm(updates);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    const current = this.productsSubject.value;
    const updated = current.map(p =>
      p.id === id ? {
        ...p,
        name: updates.name,
        description: updates.description,
        price: updates.price,
        imgUrl: updates.imgUrl,
        images: updates.images || [updates.imgUrl],
        stockQuantity: updates.stockQuantity,
        category: this.getCategoryById(updates.category),
        options: updates.options || [],
        inStock: updates.stockQuantity > 0,
        dtUpdated: new Date().toISOString()
      } : p
    );

    this.productsSubject.next(updated);
    this.saveProductsToStorage();

    const product = updated.find(p => p.id === id);
    this.notificationService.showSuccess('Produto atualizado com sucesso!');
    return of(product!).pipe(delay(600));
  }

  /**
   * Exclui produto
   */
  deleteProduct(id: string): Observable<boolean> {
    const current = this.productsSubject.value;
    const filtered = current.filter(p => p.id !== id);
    this.productsSubject.next(filtered);
    this.saveProductsToStorage();

    this.notificationService.showSuccess('Produto excluído com sucesso!');
    return of(true).pipe(delay(400));
  }

  /**
   * Ação em lote (ativar/desativar/excluir)
   */
  bulkAction(action: BulkAction): Observable<boolean> {
    const current = this.productsSubject.value;
    let updated: Product[];

    switch (action.type) {
      case 'activate':
        updated = current.map(p =>
          action.productIds.includes(p.id) ? { ...p, inStock: true } : p
        );
        break;
      case 'deactivate':
        updated = current.map(p =>
          action.productIds.includes(p.id) ? { ...p, inStock: false } : p
        );
        break;
      case 'delete':
        updated = current.filter(p => !action.productIds.includes(p.id));
        break;
      default:
        updated = current;
    }

    this.productsSubject.next(updated);
    this.saveProductsToStorage();

    const actionText = ProductAdminHelper.getBulkActionText(action.type);
    this.notificationService.showSuccess(
      `${action.productIds.length} produtos ${actionText} com sucesso!`
    );

    return of(true).pipe(delay(1000));
  }

  // ========== 🏷️ MÉTODOS DE CATEGORIA ==========

  /**
   * Obtém todas as categorias
   */
  getCategories(): Observable<Category[]> {
    const categories = CategoryHelper.getDefaultCategories();
    return of(categories).pipe(delay(300));
  }

  /**
   * Obtém categoria por slug
   */
  getCategoryBySlug(slug: string): Observable<Category | undefined> {
    const categories = CategoryHelper.getDefaultCategories();
    const category = CategoryHelper.getCategoryBySlug(categories, slug);
    return of(category).pipe(delay(200));
  }

  /**
   * Cria nova categoria
   */
  createCategory(categoryData: Partial<Category>): Observable<Category> {
    if (!CategoryHelper.isValidCategory(categoryData)) {
      this.notificationService.showError('Dados da categoria inválidos');
      throw new Error('Dados da categoria inválidos');
    }

    const newCategory: Category = {
      id: this.generateCategoryId(),
      name: categoryData.name!,
      description: categoryData.description!,
      slug: categoryData.slug || categoryData.name!.toLowerCase(),
      icon: categoryData.icon || CategoryHelper.getIconBySlug(categoryData.slug as any)
    };

    // Em produção, isso seria uma chamada API
    this.notificationService.showSuccess('Categoria criada com sucesso!');
    return of(newCategory).pipe(delay(600));
  }

  // ========== 🛠️ MÉTODOS PRIVADOS ==========

  /**
   * Inicializa produtos
   */
  private initializeProducts(): void {
    const storedProducts = this.loadProductsFromStorage();
    if (storedProducts && storedProducts.length > 0) {
      this.productsSubject.next(storedProducts);
    } else {
      this.productsSubject.next(this.createMockProducts());
      this.saveProductsToStorage();
    }
  }

  /**
   * Melhora produtos com opções
   */
  private enhanceProductsWithOptions(products: Product[]): Product[] {
    return products.map(product => this.enhanceProductWithOptions(product));
  }

  /**
   * Melhora produto individual com opções
   */
  private enhanceProductWithOptions(product: Product): Product {
    return {
      ...product,
      inStock: ProductHelper.isInStock(product),
      options: ProductHelper.getOptionsForProduct(product),
      images: ProductHelper.getProductImages(product)
    };
  }

  /**
   * Obtém ID da categoria por slug
   */
  private getCategoryIdBySlug(slug: string): string {
    const categories = CategoryHelper.getDefaultCategories();
    const category = categories.find(cat => cat.slug === slug);
    return category?.id || '1';
  }

  /**
   * Obtém categoria por ID
   */
  private getCategoryById(categoryId: string): Category {
    const categories = CategoryHelper.getDefaultCategories();
    return categories.find(cat => cat.id === categoryId) || categories[0];
  }

  // ========== 💾 GERENCIAMENTO DE STORAGE ==========

  /**
   * Carrega produtos do localStorage
   */
  private loadProductsFromStorage(): Product[] | null {
    try {
      const stored = localStorage.getItem(this.PRODUCTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao carregar produtos do storage:', error);
      return null;
    }
  }

  /**
   * Salva produtos no localStorage
   */
  private saveProductsToStorage(): void {
    try {
      localStorage.setItem(
        this.PRODUCTS_STORAGE_KEY,
        JSON.stringify(this.productsSubject.value)
      );
    } catch (error) {
      console.error('Erro ao salvar produtos no storage:', error);
    }
  }

  // ========== 🆔 GERADORES DE ID ==========

  private generateProductId(): string {
    return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCategoryId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========== 🧪 MÉTODOS PARA DESENVOLVIMENTO ==========

  /**
   * Cria produtos mock iniciais
   */
  private createMockProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Anel Solitário',
        description: 'Anel em prata 925 com pedra solitária.',
        price: 199.0,
        imgUrl: 'https://picsum.photos/300/300?random=1',
        images: [
          'https://picsum.photos/600/600?random=1',
          'https://picsum.photos/600/600?random=11',
          'https://picsum.photos/600/600?random=12'
        ],
        stockQuantity: 10,
        dtCreated: '2024-01-01T00:00:00',
        dtUpdated: '2024-01-01T00:00:00',
        category: {
          id: '1',
          name: 'aneis',
          description: 'Anéis em prata',
          slug: CategorySlug.ANEIS
        }
      },
      {
        id: '2',
        name: 'Anel Coração Vazado',
        description: 'Anel delicado em prata 925 com formato de coração.',
        price: 149.0,
        imgUrl: 'https://picsum.photos/300/300?random=2',
        images: [
          'https://picsum.photos/600/600?random=2',
          'https://picsum.photos/600/600?random=21',
          'https://picsum.photos/600/600?random=22',
          'https://picsum.photos/600/600?random=23'
        ],
        stockQuantity: 15,
        dtCreated: '2024-01-05T00:00:00',
        dtUpdated: '2024-01-05T00:00:00',
        category: {
          id: '1',
          name: 'aneis',
          description: 'Anéis em prata',
          slug: CategorySlug.ANEIS
        }
      },
      {
        id: '3',
        name: 'Anel Trançado',
        description: 'Anel em prata 925 com design trançado.',
        price: 179.0,
        imgUrl: 'https://picsum.photos/300/300?random=3',
        images: [
          'https://picsum.photos/600/600?random=3',
          'https://picsum.photos/600/600?random=31'
        ],
        stockQuantity: 8,
        dtCreated: '2024-01-10T00:00:00',
        dtUpdated: '2024-01-10T00:00:00',
        category: {
          id: '1',
          name: 'aneis',
          description: 'Anéis em prata',
          slug: CategorySlug.ANEIS
        }
      },
      {
        id: '4',
        name: 'Bracelete Minimalista',
        description: 'Bracelete em prata 925 estilo minimalista.',
        price: 220.0,
        imgUrl: 'https://picsum.photos/300/300?random=4',
        images: [
          'https://picsum.photos/600/600?random=4',
          'https://picsum.photos/600/600?random=41',
          'https://picsum.photos/600/600?random=42',
          'https://picsum.photos/600/600?random=43'
        ],
        stockQuantity: 12,
        dtCreated: '2024-01-12T00:00:00',
        dtUpdated: '2024-01-12T00:00:00',
        category: {
          id: '2',
          name: 'braceletes',
          description: 'Braceletes em prata',
          slug: CategorySlug.BRACELETES
        }
      },
      {
        id: '5',
        name: 'Bracelete Aberto',
        description: 'Bracelete ajustável em prata 925.',
        price: 250.0,
        imgUrl: 'https://picsum.photos/300/300?random=5',
        images: [
          'https://picsum.photos/600/600?random=5',
          'https://picsum.photos/600/600?random=51'
        ],
        stockQuantity: 9,
        dtCreated: '2024-01-15T00:00:00',
        dtUpdated: '2024-01-15T00:00:00',
        category: {
          id: '2',
          name: 'braceletes',
          description: 'Braceletes em prata',
          slug: CategorySlug.BRACELETES
        }
      },
      {
        id: '6',
        name: 'Bracelete Trabalhado',
        description: 'Bracelete em prata 925 com detalhes artesanais.',
        price: 280.0,
        imgUrl: 'https://picsum.photos/300/300?random=6',
        stockQuantity: 6,
        dtCreated: '2024-01-20T00:00:00',
        dtUpdated: '2024-01-20T00:00:00',
        category: {
          id: '2',
          name: 'braceletes',
          description: 'Braceletes em prata',
          slug: CategorySlug.BRACELETES
        }
      },
      {
        id: '7',
        name: 'Colar Ponto de Luz',
        description: 'Colar em prata 925 com pedra central brilhante.',
        price: 199.0,
        imgUrl: 'https://picsum.photos/300/300?random=7',
        images: [
          'https://picsum.photos/600/600?random=7',
          'https://picsum.photos/600/600?random=71',
          'https://picsum.photos/600/600?random=72'
        ],
        stockQuantity: 20,
        dtCreated: '2024-01-22T00:00:00',
        dtUpdated: '2024-01-22T00:00:00',
        category: {
          id: '3',
          name: 'colares',
          description: 'Colares em prata',
          slug: CategorySlug.COLARES
        }
      },
      {
        id: '8',
        name: 'Colar Coração',
        description: 'Colar em prata 925 com pingente de coração.',
        price: 210.0,
        imgUrl: 'https://picsum.photos/300/300?random=8',
        stockQuantity: 18,
        dtCreated: '2024-01-25T00:00:00',
        dtUpdated: '2024-01-25T00:00:00',
        category: {
          id: '3',
          name: 'colares',
          description: 'Colares em prata',
          slug: CategorySlug.COLARES
        }
      },
      {
        id: '9',
        name: 'Colar Medalhão',
        description: 'Colar em prata 925 com medalhão clássico.',
        price: 260.0,
        imgUrl: 'https://picsum.photos/300/300?random=9',
        stockQuantity: 7,
        dtCreated: '2024-01-28T00:00:00',
        dtUpdated: '2024-01-28T00:00:00',
        category: {
          id: '3',
          name: 'colares',
          description: 'Colares em prata',
          slug: CategorySlug.COLARES
        }
      },
      {
        id: '10',
        name: 'Brinco Argola Pequena',
        description: 'Brinco em prata 925 em formato de argola pequena.',
        price: 130.0,
        imgUrl: 'https://picsum.photos/300/300?random=10',
        stockQuantity: 25,
        dtCreated: '2024-02-01T00:00:00',
        dtUpdated: '2024-02-01T00:00:00',
        category: {
          id: '4',
          name: 'brincos',
          description: 'Brincos em prata',
          slug: CategorySlug.BRINCOS
        }
      },
      {
        id: '11',
        name: 'Brinco Ponto de Luz',
        description: 'Brinco pequeno em prata 925 com pedra brilhante.',
        price: 150.0,
        imgUrl: 'https://picsum.photos/300/300?random=11',
        stockQuantity: 22,
        dtCreated: '2024-02-05T00:00:00',
        dtUpdated: '2024-02-05T00:00:00',
        category: {
          id: '4',
          name: 'brincos',
          description: 'Brincos em prata',
          slug: CategorySlug.BRINCOS
        }
      },
      {
        id: '12',
        name: 'Conjunto Completo',
        description: 'Conjunto com anel, bracelete e colar combinando.',
        price: 450.0,
        imgUrl: 'https://picsum.photos/300/300?random=12',
        stockQuantity: 5,
        dtCreated: '2024-02-10T00:00:00',
        dtUpdated: '2024-02-10T00:00:00',
        category: {
          id: '5',
          name: 'conjuntos',
          description: 'Conjuntos completos',
          slug: CategorySlug.ANEIS,
        }
      },
      {
        id: '13',
        name: 'Pulseira Tennis',
        description: 'Pulseira em prata com design tennis clássico.',
        price: 320.0,
        imgUrl: 'https://picsum.photos/300/300?random=13',
        stockQuantity: 8,
        dtCreated: '2024-02-15T00:00:00',
        dtUpdated: '2024-02-15T00:00:00',
        category: {
          id: '6',
          name: 'pulseiras',
          description: 'Pulseiras elegantes',
          slug: CategorySlug.BRACELETES
        }
      },
      {
        id: '14',
        name: 'Tornozeleira Prata',
        description: 'Tornozeleira delicada em prata 925.',
        price: 180.0,
        imgUrl: 'https://picsum.photos/300/300?random=14',
        stockQuantity: 12,
        dtCreated: '2024-02-20T00:00:00',
        dtUpdated: '2024-02-20T00:00:00',
        category: {
          id: '7',
          name: 'tornozeleiras',
          description: 'Tornozeleiras delicadas',
          slug: CategorySlug.BRACELETES
        }
      },
      {
        id: '15',
        name: 'Anel Promessa',
        description: 'Anel de promessa em prata com detalhes finos.',
        price: 165.0,
        imgUrl: 'https://picsum.photos/300/300?random=15',
        stockQuantity: 0, // Esgotado para testar
        dtCreated: '2024-02-25T00:00:00',
        dtUpdated: '2024-02-25T00:00:00',
        category: {
          id: '1',
          name: 'aneis',
          description: 'Anéis em prata',
          slug: CategorySlug.ANEIS
        }
      }
    ];
  }

  /**
   * Adiciona produto mock para testes
   */
  addMockProduct(): void {
    const mockProduct: Product = {
      id: this.generateProductId(),
      name: 'Produto de Teste',
      description: 'Descrição do produto de teste',
      price: 99.90,
      imgUrl: 'https://picsum.photos/300/300?random=99',
      stockQuantity: 10,
      dtCreated: new Date().toISOString(),
      dtUpdated: new Date().toISOString(),
      category: {
        id: '1',
        name: 'aneis',
        description: 'Anéis em prata',
        slug: CategorySlug.ANEIS
      }
    };

    const current = this.productsSubject.value;
    this.productsSubject.next([...current, mockProduct]);
    this.saveProductsToStorage();

    this.notificationService.showSuccess('Produto mock adicionado!');
  }

  /**
   * Reseta para produtos mock iniciais
   */
  resetToMockProducts(): void {
    this.productsSubject.next(this.createMockProducts());
    this.saveProductsToStorage();
    this.notificationService.showInfo('Produtos resetados para estado inicial');
  }
}