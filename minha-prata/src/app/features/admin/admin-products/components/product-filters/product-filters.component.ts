import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category, ProductFilters } from '../../../../../core/models';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.scss']
})
export class ProductFiltersComponent {
  @Input() filters!: ProductFilters;
  @Input() categories: Category[] = []; // ← MESMO TIPO DO PRODUCT-LIST
  @Output() filtersChange = new EventEmitter<ProductFilters>();
  @Output() clear = new EventEmitter<void>();
}
