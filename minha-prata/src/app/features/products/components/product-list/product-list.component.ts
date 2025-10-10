import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from '../../../../core/models/product/product.model';
import { ProductDataService } from '../../../../core/services/data/product-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../../../core/services/business/search.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() categoryFilter: string = 'all';

  // Produtos
  allProducts: Product[] = [];
  displayedProducts: Product[] = [];
  loading: boolean = true;

  // Busca
  isSearching: boolean = false;
  searchTerm: string = '';
  searchResultsCount: number = 0;

  // Paginação
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;
  totalItems: number = 0;

  private subscriptions = new Subscription();

  constructor(
    private productDataService: ProductDataService,
    private searchService: SearchService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProducts();
    this.subscribeToSearchState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryFilter']) {
      this.currentPage = 1;
      this.loadProducts();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadProducts(): void {
    this.loading = true;

    if (this.categoryFilter && this.categoryFilter !== 'all') {
      this.loadProductsByCategory(this.categoryFilter);
    } else {
      this.loadAllProducts();
    }
  }

  private loadAllProducts(): void {
    this.productDataService.getProducts().subscribe({
      next: (products) => {
        this.handleProductsLoaded(products);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.loading = false;
      }
    });
  }

  private loadProductsByCategory(categorySlug: string): void {
    this.productDataService.getProductsByCategory(categorySlug).subscribe({
      next: (products) => {
        this.handleProductsLoaded(products);
      },
      error: (error) => {
        console.error('Erro ao filtrar produtos:', error);
        this.loading = false;
      }
    });
  }

  private handleProductsLoaded(products: Product[]): void {
    this.allProducts = products;
    this.totalItems = products.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    if (!this.searchService.isSearching || !this.searchService.searchTerm) {
      this.applyPagination();
    }

    this.loading = false;
  }

  private subscribeToSearchState(): void {
    const searchStateSub = this.searchService.searchState$.subscribe(
      state => {
        this.isSearching = state.isSearching;
        this.searchTerm = state.term;
        this.searchResultsCount = state.resultsCount;

        if (state.results.length > 0) {
          this.displayedProducts = this.applyPaginationToResults(state.results);
        } else if (state.term && state.isSearching) {
          this.searchResultsCount = 0;
          this.displayedProducts = [];
        } else {
          this.searchResultsCount = 0;
          this.applyPagination();
        }
      }
    );

    this.subscriptions.add(searchStateSub);
  }

  private applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProducts = this.allProducts.slice(startIndex, endIndex);
  }

  private applyPaginationToResults(results: Product[]): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return results.slice(startIndex, endIndex);
  }

  // Métodos públicos
  clearSearch(): void {
    this.searchService.clearSearch();
    this.currentPage = 1;
    this.applyPagination();
  }

  onProductClick(product: Product): void {
    this.router.navigate(['/produto', product.id]);
  }

  // Métodos de paginação - CORRIGIDO
  onPageChange(page: number): void {
    this.currentPage = page;

    if (this.isSearching && this.searchTerm) {
      // Usa o observable para obter os resultados atuais
      const currentResults = this.searchService.searchState$;
      currentResults.subscribe(state => {
        this.displayedProducts = this.applyPaginationToResults(state.results);
      });
    } else {
      this.applyPagination();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get showingStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get showingEnd(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }

  get isShowingSearchResults(): boolean {
    return this.isSearching && this.searchTerm.length > 0 && this.searchResultsCount > 0;
  }

  get displayText(): string {
    if (this.isShowingSearchResults) {
      return `Mostrando ${this.showingStart}-${this.showingEnd} de ${this.searchResultsCount} resultados para "${this.searchTerm}"`;
    } else if (this.categoryFilter && this.categoryFilter !== 'all') {
      const categoryName = this.getCategoryDisplayName(this.categoryFilter);
      return `Mostrando ${this.showingStart}-${this.showingEnd} de ${this.totalItems} produtos em ${categoryName}`;
    } else {
      return `Mostrando ${this.showingStart}-${this.showingEnd} de ${this.totalItems} produtos`;
    }
  }

  private getCategoryDisplayName(categorySlug: string): string {
    const categoryMap: { [key: string]: string } = {
      'aneis': 'Anéis',
      'braceletes': 'Braceletes',
      'colares': 'Colares',
      'brincos': 'Brincos'
    };
    return categoryMap[categorySlug] || categorySlug;
  }
}