import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() addToCart = new EventEmitter<Product>();

  onViewDetails(): void {
    this.viewDetails.emit(this.product.id);
  }

  onAddToCart(): void {
    if (this.product.inStock) {
      this.addToCart.emit(this.product);
    }
  }


}
