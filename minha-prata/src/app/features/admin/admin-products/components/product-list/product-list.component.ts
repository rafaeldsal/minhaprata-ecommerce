import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { BulkAction, Product, ProductFilters, Category } from '../../../../../core/models';
import { ProductDataService } from 'src/app/core/services/data/product-data.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  // 📊 Dados
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedProducts = signal<string[]>([]);

  // 🔍 Filtros
  filters = signal<ProductFilters>({
    search: '',
    category: '',
    status: 'all',
    priceRange: { min: 0, max: 1000 },
    stockStatus: 'all'
  });

  // 📄 Paginação
  pagination = signal({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });

  // ⚡ Estados
  isLoading = signal(true);
  isBulkActionLoading = signal(false);
  showFilters = signal(false);
  searchInput = signal('');

  @ViewChild('searchInputRef') searchInputRef!: ElementRef<HTMLInputElement>;

  constructor(private productDataService: ProductDataService) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  // 📥 Carregar dados
  loadProducts(): void {
    this.isLoading.set(true);

    this.productDataService.getProductsWithFilters(
      this.filters(),
      this.pagination().currentPage,
      this.pagination().pageSize
    ).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.pagination.update(p => ({
          ...p,
          totalItems: response.total,
          totalPages: Math.ceil(response.total / p.pageSize)
        }));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadCategories(): void {
    this.productDataService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  // 🔍 Aplicar filtros
  applyFilters(): void {
    this.pagination.update(p => ({ ...p, currentPage: 1 }));
    this.selectedProducts.set([]);
    this.loadProducts();
  }

  clearFilters(): void {
    this.filters.set({
      search: '',
      category: '',
      status: 'all',
      priceRange: { min: 0, max: 1000 },
      stockStatus: 'all'
    });
    this.searchInput.set('');
    this.applyFilters();
  }

  onSearchChange(): void {
    this.filters.update(f => ({
      ...f,
      search: this.searchInput()
    }));
    this.applyFilters();
  }

  // 📄 Paginação
  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination().totalPages) {
      this.pagination.update(p => ({ ...p, currentPage: page }));
      this.loadProducts();
    }
  }

  changePageSize(size: number): void {
    this.pagination.update(p => ({
      ...p,
      pageSize: size,
      currentPage: 1
    }));
    this.loadProducts();
  }

  // ✅ Seleção de produtos
  toggleProductSelection(productId: string): void {
    this.selectedProducts.update(selected => {
      const isSelected = selected.includes(productId);
      return isSelected
        ? selected.filter(id => id !== productId)
        : [...selected, productId];
    });
  }

  toggleSelectAll(): void {
    if (this.selectedProducts().length === this.products().length) {
      this.selectedProducts.set([]);
    } else {
      this.selectedProducts.set(this.products().map(p => p.id));
    }
  }

  isAllSelected(): boolean {
    return this.products().length > 0 &&
      this.selectedProducts().length === this.products().length;
  }

  isSomeSelected(): boolean {
    return this.selectedProducts().length > 0 &&
      !this.isAllSelected();
  }

  // 🎯 Ações em lote
  async executeBulkAction(action: 'activate' | 'deactivate' | 'delete'): Promise<void> {
    if (this.selectedProducts().length === 0) return;

    const confirmed = confirm(
      `Tem certeza que deseja ${this.getActionText(action)} ${this.selectedProducts().length} produto(s)?`
    );

    if (!confirmed) return;

    this.isBulkActionLoading.set(true);

    const bulkAction: BulkAction = {
      type: action,
      productIds: this.selectedProducts()
    };

    try {
      await this.productDataService.bulkAction(bulkAction).toPromise();
      this.selectedProducts.set([]);
      this.loadProducts(); // Recarregar lista
    } catch (error) {
      console.error('Erro na ação em lote:', error);
    } finally {
      this.isBulkActionLoading.set(false);
    }
  }

  private getActionText(action: string): string {
    const actions = {
      activate: 'ativar',
      deactivate: 'desativar',
      delete: 'excluir'
    };
    return actions[action as keyof typeof actions] || action;
  }

  // 🗑️ Ação individual
  async deleteProduct(product: Product): Promise<void> {
    const confirmed = confirm(`Excluir o produto "${product.name}"?`);
    if (!confirmed) return;

    try {
      await this.productDataService.deleteProduct(product.id).toPromise();
      this.loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  }

  // 📊 Estatísticas
  getStockStatus(product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (product.stockQuantity === 0) return 'out_of_stock';
    if (product.stockQuantity <= 10) return 'low_stock';
    return 'in_stock';
  }

  getStockStatusText(product: Product): string {
    const status = this.getStockStatus(product);
    const texts = {
      in_stock: 'Em estoque',
      low_stock: 'Estoque baixo',
      out_of_stock: 'Sem estoque'
    };
    return texts[status];
  }

  getStockStatusClass(product: Product): string {
    const status = this.getStockStatus(product);
    return `status-${status}`;
  }
}
