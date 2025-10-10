import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product, ProductHelper } from '../../../../../core/models';

@Component({
  selector: 'app-product-card-admin',
  templateUrl: './product-card-admin.component.html',
  styleUrls: ['./product-card-admin.component.scss']
})
export class ProductCardAdminComponent {
  @Input() product!: Product;
  @Input() selected: boolean = false;

  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();

  get mainImage(): string {
    return ProductHelper.getMainImage(this.product);
  }

  get stockStatus(): { text: string; class: string } {
    const status = ProductHelper.getStockStatus(this.product);
    const config = {
      in_stock: { text: 'Em estoque', class: 'status-success' },
      low_stock: { text: 'Estoque baixo', class: 'status-warning' },
      out_of_stock: { text: 'Sem estoque', class: 'status-error' }
    };
    return config[status];
  }

  formatPrice(price: number): string {
    return ProductHelper.formatPrice(price);
  }

  onView(): void {
    this.view.emit(this.product.id);
  }

  onEdit(): void {
    this.edit.emit(this.product.id);
  }

  getImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/placeholder-product.jpg';
  }
}