import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, ProductHelper } from '../../models/product/product.model';
import { CategorySlug } from '../../models';

export interface SearchState {
  term: string;
  results: Product[];
  isSearching: boolean;
  hasSearched: boolean;
  lastSearchTime?: Date;
  resultsCount: number;
  activeFilters: SearchFilters;
}

export interface SearchFilters {
  categories: string[]; // ✅ Mantido - mas usando apenas IDs de categoria
  priceRange?: { min: number; max: number };
  inStockOnly: boolean;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'name';
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly SEARCH_HISTORY_KEY = 'minhaprata_search_history';
  private readonly MAX_SEARCH_HISTORY = 10;

  // 🎯 ESTADOS DA BUSCA
  private searchState = new BehaviorSubject<SearchState>(this.getInitialState());
  public searchState$: Observable<SearchState> = this.searchState.asObservable();

  // 🔍 HISTÓRICO DE BUSCAS
  private searchHistory = new BehaviorSubject<string[]>(this.loadSearchHistory());
  public searchHistory$: Observable<string[]> = this.searchHistory.asObservable();

  // ⚡ SUGESTÕES EM TEMPO REAL
  private searchSuggestions = new BehaviorSubject<string[]>([]);
  public searchSuggestions$: Observable<string[]> = this.searchSuggestions.asObservable();

  constructor() {
    this.setupSearchListeners();
  }

  // ========== 🔍 MÉTODOS PÚBLICOS PRINCIPAIS ==========

  /**
   * Define o termo de busca e executa a busca
   */
  setSearchTerm(term: string): void {
    const trimmedTerm = term.trim();
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      term: trimmedTerm,
      isSearching: trimmedTerm.length > 0,
      hasSearched: trimmedTerm.length > 0
    });

    if (trimmedTerm.length > 0) {
      this.addToSearchHistory(trimmedTerm);
      this.updateSearchSuggestions(trimmedTerm);
    } else {
      this.clearSearch();
    }
  }

  /**
   * Define os resultados da busca
   */
  setSearchResults(products: Product[]): void {
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      results: products,
      isSearching: false,
      lastSearchTime: new Date(),
      resultsCount: products.length
    });
  }

  /**
   * Executa busca com filtros
   */
  searchProducts(term: string, products: Product[], filters?: Partial<SearchFilters>): Product[] {
    this.setIsSearching(true);

    // Combina filtros atuais com novos filtros
    const activeFilters: SearchFilters = {
      ...this.searchState.value.activeFilters,
      ...filters
    };

    let results = ProductHelper.searchProducts(products, term);

    // Aplica filtros
    results = this.applyFilters(results, activeFilters);

    // Aplica ordenação
    results = this.applySorting(results, activeFilters.sortBy);

    this.setSearchResults(results);
    this.updateSearchStateFilters(activeFilters);

    return results;
  }

  /**
   * Limpa toda a busca
   */
  clearSearch(): void {
    this.searchState.next(this.getInitialState());
    this.searchSuggestions.next([]);
  }

  /**
   * Limpa apenas os resultados mantendo o termo
   */
  clearResults(): void {
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      results: [],
      resultsCount: 0
    });
  }

  // ========== 🎛️ MÉTODOS DE FILTRO ==========

  /**
   * Aplica filtros à busca
   */
  setFilters(filters: Partial<SearchFilters>): void {
    const currentState = this.searchState.value;
    const activeFilters: SearchFilters = {
      ...currentState.activeFilters,
      ...filters
    };

    this.updateSearchStateFilters(activeFilters);

    // Re-executa busca se houver termo
    if (currentState.term && currentState.hasSearched) {
      // Em uma implementação real, isso dispararia uma nova busca na API
      console.log('Filtros atualizados, buscar produtos com:', activeFilters);
    }
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters(): void {
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      activeFilters: this.getInitialState().activeFilters
    });
  }

  /**
   * Define categoria para filtro (apenas IDs)
   */
  setCategoryFilter(categoryIds: string[]): void {
    this.setFilters({ categories: categoryIds });
  }

  /**
   * Define faixa de preço para filtro
   */
  setPriceFilter(min: number, max: number): void {
    this.setFilters({ priceRange: { min, max } });
  }

  // ========== 📚 HISTÓRICO DE BUSCAS ==========

  /**
   * Adiciona termo ao histórico
   */
  addToSearchHistory(term: string): void {
    const currentHistory = this.searchHistory.value;
    const filteredHistory = currentHistory.filter(item => item !== term);
    const newHistory = [term, ...filteredHistory].slice(0, this.MAX_SEARCH_HISTORY);

    this.searchHistory.next(newHistory);
    this.saveSearchHistory(newHistory);
  }

  /**
   * Remove termo do histórico
   */
  removeFromSearchHistory(term: string): void {
    const currentHistory = this.searchHistory.value;
    const newHistory = currentHistory.filter(item => item !== term);

    this.searchHistory.next(newHistory);
    this.saveSearchHistory(newHistory);
  }

  /**
   * Limpa todo o histórico
   */
  clearSearchHistory(): void {
    this.searchHistory.next([]);
    localStorage.removeItem(this.SEARCH_HISTORY_KEY);
  }

  /**
   * Obtém termos de busca populares (mock)
   */
  getPopularSearches(): string[] {
    return [
      'anel de prata',
      'colar coração',
      'brinco pedra',
      'pulseira feminina',
      'conjunto prata',
      'aliança simples'
    ];
  }

  // ========== 💡 SUGESTÕES EM TEMPO REAL ==========

  /**
   * Atualiza sugestões de busca baseadas no termo
   */
  private updateSearchSuggestions(term: string): void {
    if (term.length < 2) {
      this.searchSuggestions.next([]);
      return;
    }

    const suggestions = this.generateSearchSuggestions(term);
    this.searchSuggestions.next(suggestions);
  }

  /**
   * Gera sugestões de busca (mock - integrar com API depois)
   */
  private generateSearchSuggestions(term: string): string[] {
    const popularSearches = this.getPopularSearches();
    const history = this.searchHistory.value;

    const allSuggestions = [...popularSearches, ...history];

    return allSuggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 5); // Limita a 5 sugestões
  }

  // ========== 🔧 MÉTODOS DE CONSULTA ==========

  get isSearching(): boolean {
    return this.searchState.value.isSearching;
  }

  get searchTerm(): string {
    return this.searchState.value.term;
  }

  get hasResults(): boolean {
    return this.searchState.value.resultsCount > 0;
  }

  get resultsCount(): number {
    return this.searchState.value.resultsCount;
  }

  get activeFilters(): SearchFilters {
    return this.searchState.value.activeFilters;
  }

  // ========== 🛠️ MÉTODOS PRIVADOS ==========

  /**
   * Configura listeners para busca
   */
  private setupSearchListeners(): void {
    // Pode ser expandido para eventos de teclado, etc.
  }

  /**
   * Aplica filtros aos produtos
   */
  private applyFilters(products: Product[], filters: SearchFilters): Product[] {
    let filtered = products;

    // Filtro por categoria (usa apenas IDs - sem CategoryHelper)
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category.id)
      );
    }

    // Filtro por faixa de preço
    if (filters.priceRange) {
      filtered = filtered.filter(product =>
        product.price >= filters.priceRange!.min &&
        product.price <= filters.priceRange!.max
      );
    }

    // Filtro por estoque
    if (filters.inStockOnly) {
      filtered = filtered.filter(product => ProductHelper.isInStock(product));
    }

    return filtered;
  }

  /**
   * Aplica ordenação aos produtos
   */
  private applySorting(products: Product[], sortBy: string): Product[] {
    switch (sortBy) {
      case 'price_asc':
        return ProductHelper.sortByPrice(products, true);
      case 'price_desc':
        return ProductHelper.sortByPrice(products, false);
      case 'name':
        return [...products].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      case 'relevance':
      default:
        return products; // Mantém ordem de relevância
    }
  }

  /**
   * Atualiza filtros no estado
   */
  private updateSearchStateFilters(filters: SearchFilters): void {
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      activeFilters: filters
    });
  }

  setIsSearching(searching: boolean): void {
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      isSearching: searching
    });
  }

  // ========== 💾 GERENCIAMENTO DE STORAGE ==========

  /**
   * Carrega histórico do localStorage
   */
  private loadSearchHistory(): string[] {
    try {
      const stored = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar histórico de busca:', error);
      return [];
    }
  }

  /**
   * Salva histórico no localStorage
   */
  private saveSearchHistory(history: string[]): void {
    try {
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico de busca:', error);
    }
  }

  /**
   * Retorna estado inicial
   */
  private getInitialState(): SearchState {
    return {
      term: '',
      results: [],
      isSearching: false,
      hasSearched: false,
      resultsCount: 0,
      activeFilters: {
        categories: [],
        inStockOnly: false,
        sortBy: 'relevance'
      }
    };
  }

  // ========== 🧪 MÉTODOS PARA DESENVOLVIMENTO ==========

  /**
   * Simula busca com dados mock (para testes)
   */
  simulateSearch(term: string): void {
    this.setSearchTerm(term);

    // Simula delay de API
    setTimeout(() => {
      const mockResults: Product[] = [
        {
          id: '1',
          name: `Resultado para "${term}" - Anel de Prata`,
          description: 'Descrição do produto encontrado',
          price: 89.90,
          imgUrl: 'https://via.placeholder.com/150',
          stockQuantity: 10,
          dtCreated: new Date().toISOString(),
          dtUpdated: new Date().toISOString(),
          category: { 
            id: '1', 
            name: 'aneis', 
            description: 'Anéis', 
            slug: CategorySlug.ANEIS,
            isActive: true,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date() 
          }
        }
      ];

      this.setSearchResults(mockResults);
    }, 500);
  }

  /**
   * Loga estado atual (para debugging)
   */
  logSearchState(): void {
    console.log('🔍 Estado da Busca:', this.searchState.value);
  }
}