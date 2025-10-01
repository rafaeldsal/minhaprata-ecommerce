import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchStateService } from '../../../../shared/services/search-state.service';
import { CategoryStateService } from 'src/app/shared/services/category-state.service';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent implements OnInit, OnDestroy {
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
    private categoryStateService: CategoryStateService,
    private router: Router
  ) {
    console.log('🔄 ProductGrid: CONSTRUTOR chamado'); // ← DEBUG
  }

  ngOnInit() {
    console.log('ProductGrid: Inicializando...'); // DEBUG

    // ESCUTE mudanças de categoria do service
    const categorySub = this.categoryStateService.selectedCategory$.subscribe(
      categorySlug => {
        console.log('ProductGrid: Categoria recebida do service:', categorySlug); // DEBUG
        this.loadProductsByCategory(categorySlug);
      }
    );

    // Também escute a rota (para quando acessar diretamente /categoria/aneis)
    const routeSub = this.activatedRoute.params.subscribe(params => {
      const categorySlug = params['categoryId'];
      console.log('ProductGrid: Parâmetro da rota:', categorySlug); // DEBUG

      if (categorySlug) {
        this.categoryStateService.setSelectedCategory(categorySlug);
      } else {
        // Se não tem categoria na rota, carrega todos
        this.loadAllProducts();
      }
    });

    // Escutar o estado da busca
    this.subscribeToSearchState();

    this.subscriptions.add(categorySub);
    this.subscriptions.add(routeSub);
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
    console.log('ProductGrid: Carregando TODOS os produtos'); // DEBUG
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
    console.log('ProductGrid: Filtrando por categoria:', categorySlug); // DEBUG

    if (categorySlug === 'all') {
      this.loadAllProducts();
      return;
    }

    this.loading = true;
    this.productService.getByCategory(categorySlug).subscribe({
      next: (products) => {
        console.log('ProductGrid: Produtos recebidos do service:', products);
        this.products = products;
        this.displayedProducts = products; // ← SEMPRE atualiza
        this.loading = false;
        console.log('ProductGrid: displayedProducts forçado:', this.displayedProducts.length);
        // this.products = products;

        // if (this.searchStateService.isSearching && this.searchStateService.searchTerm) {
        //   this.loading = false;
        // } else {
        //   this.displayedProducts = products;
        //   this.loading = false;
        // }
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
}