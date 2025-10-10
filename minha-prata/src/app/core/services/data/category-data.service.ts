import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';
import {
  Category,
  CategoryFormData,
  BulkCategoryAction,
  CategoryReorder,
  CategoryHelper,
  CategorySlug,
  CategoryFilters
} from '../../models/product/category.model';
import { NotificationService } from '../shared/notification.service';

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  selectedCategories: string[];
  filters: {
    search: string;
    status: 'all' | 'active' | 'inactive';
    parent: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CategoryDataService {
  private notificationService = inject(NotificationService);

  private readonly CATEGORIES_STORAGE_KEY = 'minhaprata_categories';
  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  private state = new BehaviorSubject<CategoryState>({
    categories: [],
    loading: false,
    selectedCategories: [],
    filters: {
      search: '',
      status: 'all',
      parent: ''
    }
  });

  public state$ = this.state.asObservable();

  constructor() {
    this.initializeCategories();
  }

  // ========== CRUD OPERATIONS ==========

  getCategories(): Observable<Category[]> {
    const categories = this.categoriesSubject.value;
    const tree = CategoryHelper.buildCategoryTree(categories);
    return of(tree).pipe(delay(500));
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    const categories = this.categoriesSubject.value;
    const category = categories.find(cat => cat.id === id);
    return of(category).pipe(delay(300));
  }

  getCategoryBySlug(slug: string): Observable<Category | undefined> {
    const categories = this.categoriesSubject.value;
    const category = CategoryHelper.getCategoryBySlug(categories, slug);
    return of(category).pipe(delay(200));
  }

  createCategory(categoryData: CategoryFormData): Observable<Category> {
    const validation = CategoryHelper.validateCategoryForm(categoryData);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    const newCategory: Category = {
      id: this.generateCategoryId(),
      ...categoryData,
      productCount: 0,
      children: [],
      order: this.getNextOrder(categoryData.parentId),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this.categoriesSubject.value;
    const updatedCategories = [...current, newCategory];
    this.categoriesSubject.next(updatedCategories);
    this.saveCategoriesToStorage();

    this.notificationService.showSuccess('Categoria criada com sucesso!');
    return of(newCategory).pipe(delay(600));
  }

  updateCategory(id: string, updates: Partial<CategoryFormData>): Observable<Category> {
    const validation = CategoryHelper.validateCategoryForm(updates as CategoryFormData);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    const current = this.categoriesSubject.value;
    const updated = current.map(cat =>
      cat.id === id
        ? {
          ...cat,
          ...updates,
          updatedAt: new Date()
        }
        : cat
    );

    this.categoriesSubject.next(updated);
    this.saveCategoriesToStorage();

    const category = updated.find(cat => cat.id === id);
    this.notificationService.showSuccess('Categoria atualizada com sucesso!');
    return of(category!).pipe(delay(500));
  }

  deleteCategory(id: string): Observable<boolean> {
    // Verificar se a categoria tem produtos
    const category = this.categoriesSubject.value.find(cat => cat.id === id);
    if (category?.productCount && category.productCount > 0) {
      this.notificationService.showError('Não é possível excluir uma categoria com produtos associados');
      throw new Error('Categoria possui produtos associados');
    }

    // Verificar se a categoria tem subcategorias
    const hasChildren = this.categoriesSubject.value.some(cat => cat.parentId === id);
    if (hasChildren) {
      this.notificationService.showError('Não é possível excluir uma categoria com subcategorias');
      throw new Error('Categoria possui subcategorias');
    }

    const current = this.categoriesSubject.value;
    const filtered = current.filter(cat => cat.id !== id);
    this.categoriesSubject.next(filtered);
    this.saveCategoriesToStorage();

    this.notificationService.showSuccess('Categoria excluída com sucesso!');
    return of(true).pipe(delay(400));
  }

  // ========== BULK ACTIONS ==========

  bulkAction(action: BulkCategoryAction): Observable<boolean> {
    const current = this.categoriesSubject.value;
    let updated: Category[];

    switch (action.type) {
      case 'activate':
        updated = current.map(cat =>
          action.categoryIds.includes(cat.id) ? { ...cat, isActive: true, updatedAt: new Date() } : cat
        );
        break;
      case 'deactivate':
        updated = current.map(cat =>
          action.categoryIds.includes(cat.id) ? { ...cat, isActive: false, updatedAt: new Date() } : cat
        );
        break;
      case 'delete':
        // Verificar se alguma categoria tem produtos ou subcategorias
        const categoriesToDelete = current.filter(cat => action.categoryIds.includes(cat.id));
        const hasProducts = categoriesToDelete.some(cat => cat.productCount && cat.productCount > 0);
        const hasChildren = categoriesToDelete.some(cat =>
          current.some(child => child.parentId === cat.id)
        );

        if (hasProducts) {
          this.notificationService.showError('Algumas categorias possuem produtos associados');
          throw new Error('Categorias possuem produtos associados');
        }

        if (hasChildren) {
          this.notificationService.showError('Algumas categorias possuem subcategorias');
          throw new Error('Categorias possuem subcategorias');
        }

        updated = current.filter(cat => !action.categoryIds.includes(cat.id));
        break;
      default:
        updated = current;
    }

    this.categoriesSubject.next(updated);
    this.saveCategoriesToStorage();

    const actionText = this.getBulkActionText(action.type);
    this.notificationService.showSuccess(
      `${action.categoryIds.length} categorias ${actionText} com sucesso!`
    );

    return of(true).pipe(delay(800));
  }

  // ========== TREE OPERATIONS ==========

  reorderCategories(reorders: CategoryReorder[]): Observable<boolean> {
    const current = this.categoriesSubject.value;
    const updated = current.map(cat => {
      const reorder = reorders.find(r => r.categoryId === cat.id);
      if (reorder) {
        return {
          ...cat,
          order: reorder.newOrder,
          parentId: reorder.parentId,
          updatedAt: new Date()
        };
      }
      return cat;
    });

    this.categoriesSubject.next(updated);
    this.saveCategoriesToStorage();

    this.notificationService.showSuccess('Ordenação atualizada com sucesso!');
    return of(true).pipe(delay(500));
  }

  getFlatCategories(): Observable<Category[]> {
    const categories = this.categoriesSubject.value;
    const tree = CategoryHelper.buildCategoryTree(categories);
    const flat = CategoryHelper.flattenCategoryTree(tree);
    return of(flat).pipe(delay(300));
  }

  // ========== UTILITY METHODS ==========

  private initializeCategories(): void {
    const storedCategories = this.loadCategoriesFromStorage();
    if (storedCategories && storedCategories.length > 0) {
      this.categoriesSubject.next(storedCategories);
    } else {
      this.categoriesSubject.next(CategoryHelper.getDefaultCategories());
      this.saveCategoriesToStorage();
    }
  }

  private loadCategoriesFromStorage(): Category[] | null {
    try {
      const stored = localStorage.getItem(this.CATEGORIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao carregar categorias do storage:', error);
      return null;
    }
  }

  private saveCategoriesToStorage(): void {
    try {
      localStorage.setItem(
        this.CATEGORIES_STORAGE_KEY,
        JSON.stringify(this.categoriesSubject.value)
      );
    } catch (error) {
      console.error('Erro ao salvar categorias no storage:', error);
    }
  }

  private generateCategoryId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextOrder(parentId?: string): number {
    const categories = this.categoriesSubject.value;
    const siblings = categories.filter(cat => cat.parentId === parentId);
    if (siblings.length === 0) return 1;
    return Math.max(...siblings.map(cat => cat.order)) + 1;
  }

  private getBulkActionText(action: BulkCategoryAction['type']): string {
    const actions = {
      activate: 'ativadas',
      deactivate: 'desativadas',
      delete: 'excluídas'
    };
    return actions[action] || action;
  }

  // ========== DEVELOPMENT METHODS ==========

  addMockCategory(): void {
    const mockCategory: Category = {
      id: this.generateCategoryId(),
      name: 'Categoria de Teste',
      description: 'Descrição da categoria de teste',
      slug: 'categoria-teste',
      icon: 'fa-solid fa-star',
      parentId: undefined,
      isActive: true,
      productCount: 0,
      order: this.getNextOrder(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this.categoriesSubject.value;
    this.categoriesSubject.next([...current, mockCategory]);
    this.saveCategoriesToStorage();

    this.notificationService.showSuccess('Categoria mock adicionada!');
  }

  resetToDefaultCategories(): void {
    this.categoriesSubject.next(CategoryHelper.getDefaultCategories());
    this.saveCategoriesToStorage();
    this.notificationService.showInfo('Categorias resetadas para estado inicial');
  }

  filterCategories(filters: CategoryFilters): Observable<Category[]> {
    return this.getCategories().pipe(
      map(categories => this.applyFilters(categories, filters))
    );
  }

  /**
   * Aplica filtros localmente
   */
  private applyFilters(categories: Category[], filters: CategoryFilters): Category[] {
    return categories.filter(category => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          category.name.toLowerCase().includes(searchTerm) ||
          category.description.toLowerCase().includes(searchTerm) ||
          category.slug.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const isActive = filters.status === 'active';
        if (category.isActive !== isActive) return false;
      }

      // Parent filter
      if (filters.parent) {
        if (category.parentId !== filters.parent) return false;
      }

      return true;
    });
  }

  /**
   * Busca rápida por nome
   */
  searchCategories(term: string): Observable<Category[]> {
    return this.getCategories().pipe(
      map(categories =>
        categories.filter(cat =>
          cat.name.toLowerCase().includes(term.toLowerCase()) ||
          cat.description.toLowerCase().includes(term.toLowerCase())
        )
      )
    );
  }

  // ========== STATE MANAGEMENT ==========

  /**
   * Atualiza estado de loading
   */
  setLoading(loading: boolean): void {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      loading
    });
  }

  /**
   * Atualiza seleção de categorias
   */
  setSelectedCategories(selectedCategories: string[]): void {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      selectedCategories
    });
  }

  /**
   * Atualiza filtros
   */
  setFilters(filters: Partial<CategoryFilters>): void {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      filters: {
        ...currentState.filters,
        ...filters
      }
    });
  }

  // ========== UTILITY GETTERS ==========

  /**
   * Verifica se há categorias selecionadas
   */
  hasSelectedCategories(): boolean {
    return this.state.value.selectedCategories.length > 0;
  }

  /**
   * Conta categorias selecionadas
   */
  getSelectedCount(): number {
    return this.state.value.selectedCategories.length;
  }

  /**
   * Verifica se todas estão selecionadas
   */
  isAllSelected(categories: Category[]): boolean {
    return this.state.value.selectedCategories.length === categories.length;
  }

  /**
   * Alterna seleção de categoria
   */
  toggleCategorySelection(categoryId: string): void {
    const currentSelected = this.state.value.selectedCategories;
    const selectedCategories = currentSelected.includes(categoryId)
      ? currentSelected.filter(id => id !== categoryId)
      : [...currentSelected, categoryId];

    this.setSelectedCategories(selectedCategories);
  }

  /**
   * Seleciona todas as categorias
   */
  selectAllCategories(categories: Category[]): void {
    const allIds = categories.map(cat => cat.id);
    this.setSelectedCategories(allIds);
  }

  /**
   * Limpa seleção
   */
  clearSelection(): void {
    this.setSelectedCategories([]);
  }
}