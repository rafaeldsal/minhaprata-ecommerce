import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService } from 'src/app/features/cart/services/cart.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-related-products',
  templateUrl: './related-products.component.html',
  styleUrls: ['./related-products.component.scss']
})
export class RelatedProductsComponent implements OnInit, OnDestroy {
  @Input() currentProductId!: string;
  @Input() categoryId!: string;
  @Input() limit: number = 4;

  relatedProducts: Product[] = [];
  loading: boolean = true;
  currentSlide = 0;

  private subscriptions = new Subscription();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRelatedProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadRelatedProducts(): void {
    this.loading = true;

    const relatedSub = this.productService.getRelatedProducts(
      this.currentProductId,
      this.categoryId,
      this.limit
    ).subscribe({
      next: (products) => {
        this.relatedProducts = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos relacionados:', error);
        this.loading = false;
      }
    });

    this.subscriptions.add(relatedSub);
  }

  // Navegação do carousel
  nextSlide(): void {
    if (this.relatedProducts.length <= this.getVisibleItems()) return;

    const maxSlide = this.relatedProducts.length - this.getVisibleItems();
    this.currentSlide = Math.min(this.currentSlide + 1, maxSlide);
  }

  prevSlide(): void {
    this.currentSlide = Math.max(this.currentSlide - 1, 0);
  }

  getVisibleItems(): number {
    if (typeof window === 'undefined') return 4;

    const width = window.innerWidth;
    if (width < 640) return 1;    // xs
    if (width < 768) return 2;    // sm
    if (width < 1024) return 3;   // md
    return 4;                     // lg+
  }

  getTransform(): string {
    const itemWidth = 100 / this.getVisibleItems();
    return `translateX(-${this.currentSlide * itemWidth}%)`;
  }

  // Ações dos produtos
  viewProductDetails(productId: string): void {
    this.router.navigate(['/produto', productId]);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();

    if (product.inStock) {
      this.cartService.addToCart(product, 1);
      this.notificationService.showSuccess(
        `${product.name} adicionado ao carrinho!`
      );
    } else {
      this.notificationService.showError(
        `${product.name} está fora de estoque!`
      );
    }
  }

  // Helper para verificar se tem produtos
  hasRelatedProducts(): boolean {
    return this.relatedProducts.length > 0;
  }

  // Helper para navigation buttons
  canGoNext(): boolean {
    return this.currentSlide < this.relatedProducts.length - this.getVisibleItems();
  }

  canGoPrev(): boolean {
    return this.currentSlide > 0;
  }

  getTotalSlides(): number {
    return Math.ceil(this.relatedProducts.length / this.getVisibleItems());
  }

  getIndicatorArray(): any[] {
    const totalSlides = this.getTotalSlides();
    return Array(totalSlides).fill(0);
  }
}
