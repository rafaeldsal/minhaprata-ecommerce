import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Category, Product, ProductFormData } from 'src/app/core/models';
import { ProductDataService } from 'src/app/core/services/data/product-data.service';
import { NotificationService } from 'src/app/core/services/shared/notification.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  readonly isLoading = signal(false);
  readonly isEditing = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly productId = signal<string | null>(null);

  productForm: FormGroup;
  imagePreviews: string[] = [];

  get imagesArray(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  get optionsArray(): FormArray {
    return this.productForm.get('options') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productDataService: ProductDataService,
    private notificationService: NotificationService
  ) {
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.checkEditMode();
  }

  private createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      imgUrl: ['', Validators.required],
      images: this.fb.array([]),
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      options: this.fb.array([])
    });
  }

  private checkEditMode(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEditing.set(true);
          this.productId.set(id);
          return this.productDataService.getProductById(id);
        }
        return [null];
      })
    ).subscribe(product => {
      if (product) {
        this.populateForm(product);
      }
    });
  }

  private loadCategories(): void {
    this.productDataService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  private populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      imgUrl: product.imgUrl,
      stockQuantity: product.stockQuantity,
      category: product.category.id
    });

    // Preencher imagens
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        this.imagesArray.push(this.fb.control(image));
        this.imagePreviews.push(image);
      });
    }

    // Preencher opções
    if (product.options && product.options.length > 0) {
      product.options.forEach(option => {
        this.addOption(option.name, option.values);
      });
    }
  }

  addImage(url: string = ''): void {
    this.imagesArray.push(this.fb.control(url, Validators.required));
    if (url) {
      this.imagePreviews.push(url);
    }
  }

  removeImage(index: number): void {
    this.imagesArray.removeAt(index);
    this.imagePreviews.splice(index, 1);
  }

  onImageUrlChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    this.imagePreviews[index] = input.value;
  }

  addOption(name: string = '', values: string[] = ['']): void {
    const optionGroup = this.fb.group({
      name: [name, Validators.required],
      values: this.fb.array(values.map(value => this.fb.control(value, Validators.required)))
    });
    this.optionsArray.push(optionGroup);
  }

  removeOption(index: number): void {
    this.optionsArray.removeAt(index);
  }

  addOptionValue(optionIndex: number): void {
    const valuesArray = this.getOptionValues(optionIndex);
    valuesArray.push(this.fb.control('', Validators.required));
  }

  removeOptionValue(optionIndex: number, valueIndex: number): void {
    const valuesArray = this.getOptionValues(optionIndex);
    valuesArray.removeAt(valueIndex);
  }

  getOptionValues(optionIndex: number): FormArray {
    return this.optionsArray.at(optionIndex).get('values') as FormArray;
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      this.notificationService.showError('Por favor, corrija os erros no formulário.');
      return;
    }

    this.isLoading.set(true);

    const formData: ProductFormData = {
      ...this.productForm.value,
      images: this.imagesArray.value.filter((url: string) => url.trim() !== '')
    };

    const operation = this.isEditing()
      ? this.productDataService.updateProduct(this.productId()!, formData)
      : this.productDataService.createProduct(formData);

    operation.subscribe({
      next: (product) => {
        const message = this.isEditing() ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!';
        this.notificationService.showSuccess(message);
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.error('Erro ao salvar produto:', error);
        this.notificationService.showError('Erro ao salvar produto. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }

  getCategoryName(category: Category): string {
    return category.name.charAt(0).toUpperCase() + category.name.slice(1);
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
  }
}
