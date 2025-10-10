import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../../../core/models/order/cart.model';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() quantityChange = new EventEmitter<number>();
  @Output() remove = new EventEmitter<void>();

  onQuantityChange(newQuantity: number): void {
    this.quantityChange.emit(newQuantity);
  }

  onRemove(): void {
    this.remove.emit();
  }

  getItemTotal(): number {
    return this.item.product.price * this.item.quantity;
  }

  getOptionsText(): string {
    if (!this.item.selectedOptions) return '';
    return Object.entries(this.item.selectedOptions)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
}
