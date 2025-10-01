import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchStateService } from '../../../../shared/services/search-state.service';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent implements OnInit, OnChanges, OnDestroy {
  @Input() categoryFilter: string = 'all';

  products: Product[] = [];
  displayedProducts: Product[] = []; // Produtos que serão mostrados (todos ou resultados da busca)
  loading: boolean = true;

  // Variáveis para controle da busca
  isSearching: boolean = false;
  searchTerm: string = '';
  searchResultsCount: number = 0;

  private subscriptions = new Subscription();

  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private searchStateService: SearchStateService,
    private router: Router
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const categorySlug = params['categoryId'];
      if (categorySlug) {
        this.loadProductsByCategory(categorySlug);
      } else {
        this.loadAllProducts();
      }
    });

    // Escutar o estado da busca
    this.subscribeToSearchState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryFilter']) {
      this.loadProductsByCategory(this.categoryFilter);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeToSearchState(): void {
    // Escutar se está em modo de busca
    const searchingSub = this.searchStateService.isSearching$.subscribe(
      searching => {
        this.isSearching = searching;
      }
    );

    // Escutar resultados da busca
    const resultsSub = this.searchStateService.currentSearchResult$.subscribe(
      results => {
        if (results.length > 0) {
          // Tem resultados de busca - mostrar apenas esses
          this.displayedProducts = results;
          this.searchResultsCount = results.length;
        } else if (this.searchStateService.searchTerm && this.searchStateService.isSearching) {
          // Busca ativa mas sem resultados
          this.displayedProducts = [];
          this.searchResultsCount = 0;
        } else {
          // Sem busca ativa - mostrar todos os produtos
          this.displayedProducts = this.products;
          this.searchResultsCount = 0;
        }
      }
    );

    // Escutar termo de busca
    const termSub = this.searchStateService.currentSearchTerm$.subscribe(
      term => {
        this.searchTerm = term;

        // Se termo vazio e não está buscando, mostrar todos os produtos
        if (!term && !this.searchStateService.isSearching) {
          this.displayedProducts = this.products;
          this.searchResultsCount = 0;
        }
      }
    );

    this.subscriptions.add(searchingSub);
    this.subscriptions.add(resultsSub);
    this.subscriptions.add(termSub);
  }

  loadAllProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;

        // Verificar se há busca ativa
        if (this.searchStateService.isSearching && this.searchStateService.searchTerm) {
          // Se há busca ativa, não altera displayedProducts (vem do searchState)
          this.loading = false;
        } else {
          // Sem busca ativa, mostrar todos os produtos
          this.displayedProducts = products;
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error ao carregar produtos: ', error);
        this.loading = false;
      }
    });
  }

  loadProductsByCategory(categorySlug: string): void {
    this.loading = true;
    this.productService.getByCategory(categorySlug).subscribe({
      next: (products) => {
        this.products = products;

        // Verificar se há busca ativa
        if (this.searchStateService.isSearching && this.searchStateService.searchTerm) {
          // Busca tem prioridade sobre filtro de categoria
          this.loading = false;
        } else {
          this.displayedProducts = products;
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Erro ao filtrar produtos:', error);
        this.loading = false;
      }
    });
  }

  // Método para limpar a busca
  clearSearch(): void {
    this.searchStateService.clearSearch();
    this.displayedProducts = this.products;
  }

  onViewDetails(productId: string): void {
    console.log('Abrir detalhes do produto:', productId);
    this.router.navigate(['/produto', productId])
  }

  onProductClick(product: Product): void {
    this.router.navigate(['/produto', product.id]);
  }

  onAddToCart(product: Product): void {
    console.log('Adicionar ao carrinho:', product);
  }
}