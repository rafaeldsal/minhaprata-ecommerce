import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

// Services
import { ProductDataService } from 'src/app/core/services/data/product-data.service';
import { NotificationService } from 'src/app/core/services/shared/notification.service';

// Models & Helpers
import { Product, ProductHelper } from 'src/app/core/models/product/product.model';
import { Category } from 'src/app/core/models/product/category.model';
import { ProductFilters, BulkAction, ProductAdminHelper } from 'src/app/core/models/product/product-admin.model';
import { CategoryDataService } from 'src/app/core/services/data/category-data.service';

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  // 🔧 Injeção de Dependências
  private readonly productDataService = inject(ProductDataService);
  private readonly notificationService = inject(NotificationService);
  private readonly categoryDataService = inject(CategoryDataService);
  private readonly router = inject(Router);

  // 🚦 Gerenciamento de Subscriptions
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // 📊 State Signals
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly selectedProducts = signal<string[]>([]);
  readonly isLoading = signal(true);
  readonly isBulkActionLoading = signal(false);
  readonly showFilters = signal(false);

  readonly searchInput = signal('');
  readonly filters = signal<ProductFilters>(ProductAdminHelper.getDefaultFilters());

  readonly pagination = signal<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });

  // 📈 Computed Values
  readonly isAllSelected = computed(() => {
    const products = this.products();
    const selected = this.selectedProducts();
    return products.length > 0 && selected.length === products.length;
  });

  readonly isSomeSelected = computed(() => {
    const selected = this.selectedProducts();
    return selected.length > 0 && !this.isAllSelected();
  });

  readonly selectedCount = computed(() => this.selectedProducts().length);

  readonly stockStatusConfig = {
    in_stock: { text: 'Em estoque', class: 'status-success' },
    low_stock: { text: 'Estoque baixo', class: 'status-warning' },
    out_of_stock: { text: 'Sem estoque', class: 'status-error' }
  };

  // 🎯 Lifecycle Hooks
  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔍 Search Configuration
  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filters.update(filters => ({
        ...filters,
        search: searchTerm
      }));
      this.applyFilters();
    });
  }

  // 📥 Data Loading Methods
  private loadInitialData(): void {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts(): void {
    this.isLoading.set(true);

    this.productDataService.getProductsWithFilters(
      this.filters(),
      this.pagination().currentPage,
      this.pagination().pageSize
    ).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.pagination.set({
          currentPage: this.pagination().currentPage,
          pageSize: this.pagination().pageSize,
          totalItems: response.total,
          totalPages: Math.ceil(response.total / this.pagination().pageSize)
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar produtos:', error);
        this.notificationService.showError('Erro ao carregar produtos');
        this.isLoading.set(false);
      }
    });
  }

  private loadCategories(): void {
    this.categoryDataService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => {
        console.error('❌ Erro ao carregar categorias:', error);
        this.notificationService.showError('Erro ao carregar categorias');
      }
    });
  }

  // 🔍 Filter Methods
  onSearchInput(value: string): void {
    this.searchInput.set(value);
    this.searchSubject.next(value);
  }

  onFiltersChange(newFilters: ProductFilters): void {
    this.filters.set(newFilters);
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.searchSubject.next('');
  }

  applyFilters(): void {
    this.pagination.update(p => ({ ...p, currentPage: 1 }));
    this.selectedProducts.set([]);
    this.loadProducts();
  }

  clearFilters(): void {
    this.filters.set(ProductAdminHelper.getDefaultFilters());
    this.searchInput.set('');
    this.applyFilters();
  }

  // 📄 Pagination Methods
  onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, currentPage: page }));
    this.loadProducts();
  }

  changePageSize(size: number): void {
    this.pagination.update(p => ({
      ...p,
      pageSize: size,
      currentPage: 1
    }));
    this.loadProducts();
  }

  // ✅ Selection Methods
  toggleProductSelection(productId: string): void {
    this.selectedProducts.update(selected => {
      const isSelected = selected.includes(productId);
      return isSelected
        ? selected.filter(id => id !== productId)
        : [...selected, productId];
    });
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedProducts.set([]);
    } else {
      this.selectedProducts.set(this.products().map(p => p.id));
    }
  }

  clearSelection(): void {
    this.selectedProducts.set([]);
  }

  // 🎯 Bulk Actions
  async executeBulkAction(action: BulkAction['type']): Promise<void> {
    const selectedCount = this.selectedProducts().length;
    if (selectedCount === 0) return;

    const actionText = ProductAdminHelper.getBulkActionText(action);
    const confirmed = confirm(
      `Tem certeza que deseja ${actionText} ${selectedCount} produto(s)?`
    );

    if (!confirmed) return;

    this.isBulkActionLoading.set(true);

    const bulkAction: BulkAction = {
      type: action,
      productIds: this.selectedProducts()
    };

    try {
      await this.productDataService.bulkAction(bulkAction).toPromise();
      this.clearSelection();
      this.loadProducts();
    } catch (error) {
      console.error('❌ Erro na ação em lote:', error);
      this.notificationService.showError('Erro ao executar ação em lote');
    } finally {
      this.isBulkActionLoading.set(false);
    }
  }

  // 🗑️ Individual Actions
  async deleteProduct(product: Product): Promise<void> {
    const confirmed = confirm(`Excluir o produto "${product.name}"?`);
    if (!confirmed) return;

    try {
      await this.productDataService.deleteProduct(product.id).toPromise();
      this.notificationService.showSuccess('Produto excluído com sucesso!');
      this.loadProducts();
    } catch (error) {
      console.error('❌ Erro ao excluir produto:', error);
      this.notificationService.showError('Erro ao excluir produto');
    }
  }

  editProduct(productId: string): void {
    this.router.navigate(['/admin/products/edit', productId]);
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  // 📊 Utility Methods
  getStockStatus(product: Product): { text: string; class: string } {
    const status = ProductHelper.getStockStatus(product);
    return this.stockStatusConfig[status];
  }

  getProductMainImage(product: Product): string {
    return ProductHelper.getMainImage(product);
  }

  formatPrice(price: number): string {
    return ProductHelper.formatPrice(price);
  }

  getCategoryName(product: Product): string {
    return product.category.name;
  }

  hasLowStock(product: Product): boolean {
    return ProductHelper.getStockStatus(product) === 'low_stock';
  }

  isOutOfStock(product: Product): boolean {
    return ProductHelper.getStockStatus(product) === 'out_of_stock';
  }

  // 🔄 Refresh & Reset
  refreshProducts(): void {
    this.loadProducts();
  }

  // 🧪 Development Methods (apenas para desenvolvimento)
  addMockProduct(): void {
    this.productDataService.addMockProduct();
    this.loadProducts();
  }

  resetToMockProducts(): void {
    this.productDataService.resetToMockProducts();
    this.loadProducts();
  }
}