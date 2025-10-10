import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CartState } from '../../../../core/models/order/cart.model';
import { CartService } from '../../../../core/services/business/cart.service';

@Component({
  selector: 'app-cart-icon',
  templateUrl: './cart-icon.component.html',
  styleUrls: ['./cart-icon.component.scss']
})
export class CartIconComponent implements OnInit {
  cartState$: Observable<CartState>;

  constructor(
    private cartService: CartService
  ) {
    this.cartState$ = this.cartService.cart$
  }

  ngOnInit(): void { }

  getCartItemsCount(cartState: CartState): number {
    return cartState.itemsCount;
  }
}
