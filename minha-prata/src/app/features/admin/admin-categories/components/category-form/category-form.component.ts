import { Component, Inject, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CategoryDataService } from '../../../../../core/services/data/category-data.service';
import { Category, CategoryFormData, CategoryHelper } from '../../../../../core/models/product/category.model';
import { MatSelect } from '@angular/material/select';

export interface CategoryFormDialogData {
  mode: 'create' | 'edit';
  categoryId?: string;
}

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryDataService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild('iconSelect') iconSelect!: MatSelect;

  // Form
  categoryForm: FormGroup;

  // State
  loading = false;
  saving = false;
  isEditMode = false;
  currentCategory: Category | null = null;

  // Options
  parentCategories: Category[] = [];
  iconOptions = CategoryHelper.getCategoryIconOptions();
  statusOptions = [
    { value: true, label: 'Ativa', icon: 'check_circle' },
    { value: false, label: 'Inativa', icon: 'cancel' }
  ];

  constructor(
    public dialogRef: MatDialogRef<CategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CategoryFormDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.categoryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadParentCategories();

    if (this.isEditMode && this.data.categoryId) {
      this.loadCategory();
    }

    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]],
      slug: ['', [
        Validators.required,
        Validators.pattern(/^[a-z0-9-]+$/)
      ]],
      icon: ['fa-solid fa-box', Validators.required],
      parentId: [''],
      isActive: [true, Validators.required]
    });
  }

  private setupFormListeners(): void {
    // Auto-generate slug from name
    this.categoryForm.get('name')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(name => {
        if (name && !this.isEditMode) {
          const slug = CategoryHelper.generateSlug(name);
          this.categoryForm.patchValue({ slug }, { emitEvent: false });
        }
      });

    // Validate slug pattern
    this.categoryForm.get('slug')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(slug => {
        const slugControl = this.categoryForm.get('slug');
        if (slug && !/^[a-z0-9-]+$/.test(slug)) {
          slugControl?.setErrors({ pattern: true });
        }
      });
  }

  private loadParentCategories(): void {
    this.loading = true;
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.parentCategories = categories.filter(cat =>
            !cat.parentId && (!this.isEditMode || cat.id !== this.data.categoryId)
          );
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar categorias', 'Fechar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  private loadCategory(): void {
    if (!this.data.categoryId) return;

    this.loading = true;
    this.categoryService.getCategoryById(this.data.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (category) => {
          if (category) {
            this.currentCategory = category;
            this.populateForm(category);
          }
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar categoria', 'Fechar', { duration: 3000 });
          this.loading = false;
          this.dialogRef.close(false);
        }
      });
  }

  private populateForm(category: Category): void {
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      slug: category.slug,
      icon: category.icon,
      parentId: category.parentId || '',
      isActive: category.isActive
    });

    // Disable slug field in edit mode to prevent conflicts
    this.categoryForm.get('slug')?.disable();
  }

  // ========== FORM ACTIONS ==========

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const formData = this.getFormData();

    const operation = this.isEditMode && this.currentCategory
      ? this.categoryService.updateCategory(this.currentCategory.id, formData)
      : this.categoryService.createCategory(formData);

    operation.subscribe({
      next: (category) => {
        this.saving = false;
        this.snackBar.open(
          `Categoria ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`,
          'Fechar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.saving = false;
        this.snackBar.open(
          error.message || `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} categoria`,
          'Fechar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onGenerateSlug(): void {
    const name = this.categoryForm.get('name')?.value;
    if (name) {
      const slug = CategoryHelper.generateSlug(name);
      this.categoryForm.patchValue({ slug });
    }
  }

  // ========== VALIDATION HELPERS ==========

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  private getFormData(): CategoryFormData {
    const formValue = this.categoryForm.getRawValue();
    return {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      slug: formValue.slug.trim(),
      icon: formValue.icon,
      parentId: formValue.parentId || undefined,
      isActive: formValue.isActive
    };
  }

  // ========== TEMPLATE HELPERS ==========

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return 'Este campo é obrigatório';
    }
    if (errors['minlength']) {
      return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['pattern']) {
      return 'Slug deve conter apenas letras minúsculas, números e hífens';
    }

    return 'Campo inválido';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getDialogTitle(): string {
    return this.isEditMode ? 'Editar Categoria' : 'Nova Categoria';
  }

  getSubmitButtonText(): string {
    if (this.saving) {
      return this.isEditMode ? 'Atualizando...' : 'Criando...';
    }
    return this.isEditMode ? 'Atualizar Categoria' : 'Criar Categoria';
  }

  getIconPreview(): string {
    const iconClass = this.categoryForm.get('icon')?.value;
    if (!iconClass) return 'folder';

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

    return iconMap[iconClass] || 'folder';
  }

  getIconPreviewForOption(iconClass: string): string {
    const iconMap: { [key: string]: string } = {
      'fa-regular fa-gem': 'diamond',
      'fa-solid fa-ring': 'favorite',
      'fa-solid fa-hands-bubbles': 'spa',
      'fa-solid fa-medal': 'military_tech',
      'fa-solid fa-wristwatch': 'watch',
      'fa-solid fa-ankh': 'language',
      'fa-solid fa-crown': 'coronavirus',
      'fa-solid fa-star': 'star',
      'fa-solid fa-heart': 'favorite',
      'fa-solid fa-moon': 'dark_mode',
      'fa-solid fa-sun': 'light_mode',
      'fa-solid fa-cloud': 'cloud',
      'fa-solid fa-flower': 'spa',
      'fa-solid fa-bolt': 'flash_on',
      'fa-solid fa-feather': 'feather'
    };

    return iconMap[iconClass] || 'folder';
  }
}