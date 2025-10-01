import { Component, OnInit } from '@angular/core';
import { CartItem, CartState } from '../../models/cart-item';
import { Observable } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit {
  cartState$: Observable<CartState>;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {
    this.cartState$ = this.cartService.cart$;
  }

  ngOnInit(): void { }

  onQuantityChange(item: CartItem, newQuantity: number): void {
    this.cartService.updateQuantity(
      item.product.id,
      newQuantity,
      item.selectedOptions
    );
  }

  onRemoveItem(item: CartItem): void {
    this.cartService.removeFromCart(
      item.product.id,
      item.selectedOptions
    );
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  proceedToCheckout(): void {
    // Futura implementação do checkout
    this.router.navigate(['/checkout']);
  }

  isCartEmpty(cartState: CartState): boolean {
    return cartState.items.length === 0;
  }
}
