import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CartService } from 'src/app/features/cart/services/cart.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private cartService: CartService
  ) { }

  onViewDetails(event: Event): void {
    event.stopPropagation(); // Evita duplicar o clique
    this.router.navigate(['/produto', this.product.id]);
  }

  onCardClick(): void {
    this.router.navigate(['/produto', this.product.id]);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation(); // Impede navegação do card

    if (this.product.inStock) {
      this.cartService.addToCart(this.product, 1);
      this.showSuccessNotification();
    } else {
      this.showErrorNotification();
    }
  }

  private showSuccessNotification(): void {
    this.notificationService.showSuccess(
      `${this.product.name} adicionado ao carrinho!`
    );
  }

  private showErrorNotification(): void {
    this.notificationService.showError(
      `${this.product.name} está fora de estoque!`
    );
  }

}
