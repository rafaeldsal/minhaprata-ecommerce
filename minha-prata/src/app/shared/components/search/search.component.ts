import { Component, Output, EventEmitter, ElementRef, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { ProductService } from '../../../features/products/services/product.service';
import { SearchStateService } from '../../services/search-state.service';
import { Product } from 'src/app/features/products/models/product';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  @Output() searchChange = new EventEmitter<string>();
  @Output() productSelected = new EventEmitter<Product>();

  searchTerm: string = '';
  showResults: boolean = false;
  isLoading: boolean = false;
  hasSearched: boolean = false;

  filteredProducts: Product[] = [];
  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();
  private isClickingResult: boolean = false;

  constructor(
    private productService: ProductService,
    private searchStateService: SearchStateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading = true;
        this.hasSearched = true;
        this.searchStateService.setIsSearching(true);
      }),
      switchMap(searchTerm => this.performSearch(searchTerm))
    ).subscribe({
      next: (products) => {
        this.filteredProducts = products;
        this.isLoading = false;

        // Atualizar o estado global da busca
        this.searchStateService.setSearchResults(products);
        this.searchStateService.setSearchTerm(this.searchTerm);
      },
      error: (error) => {
        console.error('Erro na busca:', error);
        this.isLoading = false;
        this.filteredProducts = [];
        this.searchStateService.setIsSearching(false);
      }
    });

    this.subscriptions.add(searchSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const searchBox = this.searchInput.nativeElement.parentElement;

    if (!searchBox.contains(target) && !this.isClickingResult) {
      this.showResults = false;
    }
    this.isClickingResult = false;
  }

  onSearchInput(event: any): void {
    const value = event.target.value;
    this.searchTerm = value;

    if (value.length === 0) {
      this.showResults = false;
      this.hasSearched = false;
      this.filteredProducts = [];
      this.searchChange.emit('');
      this.searchStateService.clearSearch();
      return;
    }

    this.searchSubject.next(value);
  }

  onFocus(): void {
    if (this.hasSearched && this.searchTerm.length >= 3 && this.filteredProducts.length > 0) {
      this.showResults = true;
    }
  }

  onInputClick(): void {
    // Mostrar resultados quando clicar no input (se houver resultados)
    if (this.hasSearched && this.searchTerm.length >= 3 && this.filteredProducts.length > 0) {
      this.showResults = true;
    }
  }

  onBlur(): void {
    // Não esconder resultados imediatamente - deixe o HostListener cuidar disso
    // Isso permite que o clique nos resultados seja registrado
    // setTimeout(() => {
    //   this.showResults = false;
    // }, 200);
  }

  private performSearch(searchTerm: string) {
    if (searchTerm.length < 3) {
      this.showResults = false;
      this.filteredProducts = [];
      this.searchChange.emit(searchTerm);
      this.searchStateService.setIsSearching(false);
      return this.productService.searchProducts('');
    }

    this.showResults = true;

    return this.productService.searchProducts(searchTerm).pipe(
      tap(products => {
        this.searchChange.emit(searchTerm);
      }),
      catchError(error => {
        console.error('Erro ao buscar produtos:', error);
        this.searchChange.emit(searchTerm);
        this.searchStateService.setIsSearching(false);
        return this.productService.searchProducts('');
      })
    );
  }

  selectProduct(product: Product): void {
    this.isClickingResult = true;
    this.productSelected.emit(product);
    this.showResults = false;
    this.searchTerm = product.name;

    this.router.navigate(['/produto', product.id]);

    setTimeout(() => {
      this.isClickingResult = false;
    }, 100);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.showResults = false;
    this.hasSearched = false;
    this.filteredProducts = [];
    this.searchChange.emit('');
    this.searchStateService.clearSearch();
    this.searchInput.nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.showResults = false;
        this.searchInput.nativeElement.blur();
        break;
      case 'Enter':
        if (this.filteredProducts.length === 1) {
          this.selectProduct(this.filteredProducts[0]);
        } else if (this.filteredProducts.length > 0) {
          // Focar no primeiro resultado (poderia implementar navegação por teclado completa)
          this.showResults = true;
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Poderia implementar navegação por teclado nos resultados
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Poderia implementar navegação por teclado nos resultados
        break;
    }
  }

  getCategoryName(product: Product): string {
    if (!product.category) return 'Categoria';

    if (typeof product.category === 'string') {
      return product.category;
    }

    if (typeof product.category === 'object') {
      return product.category.name || 'Categoria';
    }

    return 'Categoria';
  }

  getProductPrice(product: Product): number {
    return typeof product.price === 'number' ? product.price : 0;
  }

  getProductAriaLabel(product: Product): string {
    const category = this.getCategoryName(product);
    const price = this.getProductPrice(product).toFixed(2);
    return `${product.name}, ${category}, R$ ${price}`;
  }

  selectedProduct(product: Product): void {
    this.productSelected.emit(product);
    this.showResults = false;
    this.searchTerm = product.name;

    this.router.navigate(['/produto', product.id]);
  }
}