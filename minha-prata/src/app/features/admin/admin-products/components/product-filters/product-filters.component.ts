import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Category, ProductAdminHelper, ProductFilters } from '../../../../../core/models';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.scss']
})
export class ProductFiltersComponent {
  private fb = inject(FormBuilder);

  @Input() set filters(value: ProductFilters) {
    this.filterForm.patchValue(value, { emitEvent: false });
  }

  @Input() set categories(value: Category[]) {
    this.categoriesList.set(value);
  }

  @Output() filtersChange = new EventEmitter<ProductFilters>();
  @Output() clear = new EventEmitter<void>();

  readonly categoriesList = signal<Category[]>([]);
  readonly isExpanded = signal(false);

  filterForm: FormGroup;

  // Getters para os controles com tipagem correta
  get searchControl(): FormControl {
    return this.filterForm.get('search') as FormControl;
  }

  get categoryControl(): FormControl {
    return this.filterForm.get('category') as FormControl;
  }

  get statusControl(): FormControl {
    return this.filterForm.get('status') as FormControl;
  }

  get stockStatusControl(): FormControl {
    return this.filterForm.get('stockStatus') as FormControl;
  }

  get priceRangeGroup(): FormGroup {
    return this.filterForm.get('priceRange') as FormGroup;
  }

  get minPriceControl(): FormControl {
    return this.priceRangeGroup.get('min') as FormControl;
  }

  get maxPriceControl(): FormControl {
    return this.priceRangeGroup.get('max') as FormControl;
  }

  constructor() {
    this.filterForm = this.createFilterForm();
    this.setupFormListeners();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      category: [''],
      status: ['all'],
      priceRange: this.fb.group({
        min: [0],
        max: [1000]
      }),
      stockStatus: ['all']
    });
  }

  private setupFormListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.filtersChange.emit(value);
      });
  }

  clearFilters(): void {
    this.filterForm.patchValue(ProductAdminHelper.getDefaultFilters());
    this.clear.emit();
  }

  toggleExpansion(): void {
    this.isExpanded.set(!this.isExpanded());
  }

  getCategoryName(category: Category): string {
    return category.name.charAt(0).toUpperCase() + category.name.slice(1);
  }
}