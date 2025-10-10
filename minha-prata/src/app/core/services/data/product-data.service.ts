import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, of } from 'rxjs';
import { Product, ProductFormData, ProductHelper, ProductOption } from '../../models/product/product.model';
import { Category } from '../../models/product/category.model';
import { ProductFilters, BulkAction, ProductAdminHelper } from '../../models/product/product-admin.model';
import { NotificationService } from '../shared/notification.service';
import { CategoryDataService } from './category-data.service';

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {
  private notificationService = inject(NotificationService);
  private categoryDataService = inject(CategoryDataService);

  private readonly PRODUCTS_STORAGE_KEY = 'minhaprata_products';
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor() {
    this.initializeProducts();
  }

  // ========== 🛍️ MÉTODOS PÚBLICOS - CLIENTE ==========

  getProducts(): Observable<Product[]> {
    const enhancedProducts = this.enhanceProductsWithOptions(this.productsSubject.value);
    console.log('📦 Buscando todos os produtos...');
    return of(enhancedProducts).pipe(delay(1000));
  }

  getProductsByCategory(categorySlug: string): Observable<Product[]> {
    if (categorySlug === 'all') {
      return this.getProducts();
    }

    // Agora usa o CategoryDataService
    return this.categoryDataService.getCategoryBySlug(categorySlug).pipe(
      map(category => {
        if (!category) {
          this.notificationService.showWarning(`Categoria "${categorySlug}" não encontrada`);
          return [];
        }

        const filtered = ProductHelper.filterByCategory(
          this.productsSubject.value,
          category.id
        );

        const enhancedProducts = this.enhanceProductsWithOptions(filtered);
        console.log(`📦 Buscando produtos da categoria: ${categorySlug}`);
        return enhancedProducts;
      }),
      delay(800)
    );
  }

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

  getFeaturedProducts(): Observable<Product[]> {
    const featured = this.productsSubject.value
      .filter(product => product.stockQuantity > 5)
      .slice(0, 6);

    const enhancedProducts = this.enhanceProductsWithOptions(featured);
    return of(enhancedProducts).pipe(delay(600));
  }

  // ========== ⚙️ MÉTODOS PÚBLICOS - ADMIN ==========

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

  createProduct(productData: ProductFormData): Observable<Product> {
    const validation = ProductAdminHelper.validateProductForm(productData);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    // Agora usa o CategoryDataService para buscar a categoria
    return this.categoryDataService.getCategoryById(productData.category).pipe(
      map(category => {
        if (!category) {
          throw new Error('Categoria não encontrada');
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
          category: category,
          options: productData.options || [],
          inStock: productData.stockQuantity > 0
        };

        const current = this.productsSubject.value;
        const updatedProducts = [...current, newProduct];
        this.productsSubject.next(updatedProducts);
        this.saveProductsToStorage();

        this.notificationService.showSuccess('Produto criado com sucesso!');
        return newProduct;
      }),
      delay(800)
    );
  }

  updateProduct(id: string, updates: ProductFormData): Observable<Product> {
    const validation = ProductAdminHelper.validateProductForm(updates);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    // Agora usa o CategoryDataService para buscar a categoria
    return this.categoryDataService.getCategoryById(updates.category).pipe(
      map(category => {
        if (!category) {
          throw new Error('Categoria não encontrada');
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
            category: category,
            options: updates.options || [],
            inStock: updates.stockQuantity > 0,
            dtUpdated: new Date().toISOString()
          } : p
        );

        this.productsSubject.next(updated);
        this.saveProductsToStorage();

        const product = updated.find(p => p.id === id);
        this.notificationService.showSuccess('Produto atualizado com sucesso!');
        return product!;
      }),
      delay(600)
    );
  }

  deleteProduct(id: string): Observable<boolean> {
    const current = this.productsSubject.value;
    const filtered = current.filter(p => p.id !== id);
    this.productsSubject.next(filtered);
    this.saveProductsToStorage();

    this.notificationService.showSuccess('Produto excluído com sucesso!');
    return of(true).pipe(delay(400));
  }

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

  // ========== 🛠️ MÉTODOS PRIVADOS ==========

  private initializeProducts(): void {
    const storedProducts = this.loadProductsFromStorage();
    if (storedProducts && storedProducts.length > 0) {
      this.productsSubject.next(storedProducts);
    } else {
      // Agora usa o CategoryDataService para popular as categorias
      this.categoryDataService.getCategories().subscribe(categories => {
        const products = this.createMockProducts(categories);
        this.productsSubject.next(products);
        this.saveProductsToStorage();
      });
    }
  }

  private enhanceProductsWithOptions(products: Product[]): Product[] {
    return products.map(product => this.enhanceProductWithOptions(product));
  }

  private enhanceProductWithOptions(product: Product): Product {
    return {
      ...product,
      inStock: ProductHelper.isInStock(product),
      options: ProductHelper.getOptionsForProduct(product),
      images: ProductHelper.getProductImages(product)
    };
  }

  // ========== 💾 GERENCIAMENTO DE STORAGE ==========

  private loadProductsFromStorage(): Product[] | null {
    try {
      const stored = localStorage.getItem(this.PRODUCTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao carregar produtos do storage:', error);
      return null;
    }
  }

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

  // ========== 🧪 MÉTODOS PARA DESENVOLVIMENTO ==========

  private createMockProducts(categories: Category[]): Product[] {
    // Busca as categorias específicas
    const aneisCategory = categories.find(c => c.slug === 'aneis');
    const braceletesCategory = categories.find(c => c.slug === 'braceletes');
    const colaresCategory = categories.find(c => c.slug === 'colares');
    const brincosCategory = categories.find(c => c.slug === 'brincos');

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
        category: aneisCategory!
      },
      // ... resto dos produtos mock (ajustar para usar as categorias do serviço)
    ];
  }

  addMockProduct(): void {
    this.categoryDataService.getCategories().subscribe(categories => {
      const aneisCategory = categories.find(c => c.slug === 'aneis');

      const mockProduct: Product = {
        id: this.generateProductId(),
        name: 'Produto de Teste',
        description: 'Descrição do produto de teste',
        price: 99.90,
        imgUrl: 'https://picsum.photos/300/300?random=99',
        stockQuantity: 10,
        dtCreated: new Date().toISOString(),
        dtUpdated: new Date().toISOString(),
        category: aneisCategory!
      };

      const current = this.productsSubject.value;
      this.productsSubject.next([...current, mockProduct]);
      this.saveProductsToStorage();

      this.notificationService.showSuccess('Produto mock adicionado!');
    });
  }

  resetToMockProducts(): void {
    this.categoryDataService.getCategories().subscribe(categories => {
      const products = this.createMockProducts(categories);
      this.productsSubject.next(products);
      this.saveProductsToStorage();
      this.notificationService.showInfo('Produtos resetados para estado inicial');
    });
  }
}