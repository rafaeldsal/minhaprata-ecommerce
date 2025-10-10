import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'; // ← Adicionar FormControl
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CategoryDataService } from '../../../../../core/services/data/category-data.service';
import { Category, CategoryFormData, BulkCategoryAction } from '../../../../../core/models';
import { CategoryFormComponent } from '../category-form/category-form.component';
// import { CategoryTreeComponent } from '../category-tree/category-tree.component'; // ← Comentar por enquanto
// import { CategoryBulkActionsComponent } from '../category-bulk-actions/category-bulk-actions.component'; // ← Comentar por enquanto

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryDataService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  // State
  state$ = this.categoryService.state$;
  categories: Category[] = [];

  // Forms - Usar FormControl explícito para evitar erros de tipo
  filtersForm: FormGroup<{
    search: FormControl<string | null>;
    status: FormControl<string | null>;
    parent: FormControl<string | null>;
  }>;

  // UI State
  isBulkActionsOpen = false;
  viewMode: 'list' | 'tree' = 'list';

  // Filter options
  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' }
  ];

  parentOptions = [
    { value: '', label: 'Todas' }
  ];

  constructor() {
    // Inicializar FormGroup com tipos explícitos
    this.filtersForm = this.fb.group({
      search: this.fb.control(''),
      status: this.fb.control('all'),
      parent: this.fb.control('')
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.categoryService.setLoading(true);
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.updateParentOptions();
          this.categoryService.setLoading(false);
        },
        error: (error) => {
          this.snackBar.open('Erro ao carregar categorias', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.categoryService.setLoading(false);
        }
      });
  }

  private setupSubscriptions(): void {
    // Filtros em tempo real
    this.filtersForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.categoryService.setFilters(filters as any);
      });

    // Atualizar categorias quando o estado mudar
    this.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        // A filtragem será feita no template usando getFilteredCategories()
      });
  }

  private updateParentOptions(): void {
    const parentCategories = this.categories
      .filter(cat => !cat.parentId)
      .map(cat => ({ value: cat.id, label: cat.name }));

    this.parentOptions = [
      { value: '', label: 'Todas' },
      ...parentCategories
    ];
  }

  // ========== PUBLIC METHODS ==========

  openCreateModal(): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '700px',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '90vh',
      panelClass: 'category-form-modal', // Classe customizada
      autoFocus: false,
      data: {
        mode: 'create'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  openEditModal(categoryId: string): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '700px',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '90vh',
      panelClass: 'category-form-modal', // Classe customizada
      autoFocus: false,
      data: {
        mode: 'edit',
        categoryId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  deleteCategory(categoryId: string): void {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.snackBar.open('Categoria excluída com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCategories();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Erro ao excluir categoria', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  toggleCategorySelection(categoryId: string): void {
    this.categoryService.toggleCategorySelection(categoryId);
  }

  toggleSelectAll(): void {
    if (this.categoryService.isAllSelected(this.categories)) {
      this.categoryService.clearSelection();
    } else {
      this.categoryService.selectAllCategories(this.categories);
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'tree' : 'list';
    // Por enquanto, forçar viewMode 'list' até implementar tree view
    this.viewMode = 'list';
  }

  refreshCategories(): void {
    this.loadCategories();
  }

  clearFilters(): void {
    this.filtersForm.patchValue({
      search: '',
      status: 'all',
      parent: ''
    });
  }

  onBulkAction(action: BulkCategoryAction): void {
    this.categoryService.bulkAction(action).subscribe({
      next: () => {
        const actionText = this.getActionText(action.type);
        this.snackBar.open(
          `${action.categoryIds.length} categorias ${actionText} com sucesso!`,
          'Fechar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.loadCategories();
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Erro ao executar ação', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private getActionText(action: string): string {
    const actions: { [key: string]: string } = {
      activate: 'ativadas',
      deactivate: 'desativadas',
      delete: 'excluídas'
    };
    return actions[action] || action;
  }

  // ========== TEMPLATE HELPERS ==========

  getFilteredCategories(): Category[] {
    // Filtragem local baseada nos filtros atuais
    const state = (this.categoryService as any).state.value; // Temporary workaround
    const filters = state?.filters || { search: '', status: 'all', parent: '' };

    return this.categories.filter(category => {
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

  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }

  getSelectedCount(): number {
    return this.categoryService.getSelectedCount();
  }

  hasSelectedCategories(): boolean {
    return this.categoryService.hasSelectedCategories();
  }

  isAllSelected(): boolean {
    return this.categoryService.isAllSelected(this.categories);
  }

  getCategoryIcon(category: Category): string {
    const iconMap: { [key: string]: string } = {
      'fa-regular fa-gem': 'diamond',
      'fa-solid fa-ring': 'favorite',
      'fa-solid fa-hands-bubbles': 'spa',
      'fa-solid fa-medal': 'military_tech',
      'fa-solid fa-star': 'star',
      'fa-solid fa-heart': 'favorite',
      'fa-solid fa-moon': 'dark_mode',
      'fa-solid fa-sun': 'light_mode',
      'fa-solid fa-box': 'inventory_2'
    };

    return iconMap[category.icon || ''] || 'folder';
  }

  // Método auxiliar para acessar o service no template
  get categoryServiceAccessor(): CategoryDataService {
    return this.categoryService;
  }
}