import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchStateService } from '../../../../core/services/search-state.service';

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
    private productService: ProductService,
    private searchStateService: SearchStateService,
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
    this.productService.getAll().subscribe({
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
    this.productService.getByCategory(categorySlug).subscribe({
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

    if (!this.searchStateService.isSearching || !this.searchStateService.searchTerm) {
      this.applyPagination();
    }

    this.loading = false;
  }

  private subscribeToSearchState(): void {
    const searchingSub = this.searchStateService.isSearching$.subscribe(
      searching => {
        this.isSearching = searching;
      }
    );

    const resultsSub = this.searchStateService.currentSearchResult$.subscribe(
      results => {
        if (results.length > 0) {
          this.searchResultsCount = results.length;
          this.displayedProducts = this.applyPaginationToResults(results);
        } else if (this.searchStateService.searchTerm && this.searchStateService.isSearching) {
          this.searchResultsCount = 0;
          this.displayedProducts = [];
        } else {
          this.searchResultsCount = 0;
          this.applyPagination();
        }
      }
    );

    const termSub = this.searchStateService.currentSearchTerm$.subscribe(
      term => {
        this.searchTerm = term;
      }
    );

    this.subscriptions.add(searchingSub);
    this.subscriptions.add(resultsSub);
    this.subscriptions.add(termSub);
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
    this.searchStateService.clearSearch();
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
      const currentResults = this.searchStateService.currentSearchResult$;
      currentResults.subscribe(results => {
        this.displayedProducts = this.applyPaginationToResults(results);
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
}