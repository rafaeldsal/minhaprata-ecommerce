import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product/product.model';
import { ProductDataService } from '../../../../core/services/data/product-data.service';
import { CartService } from '../../../../core/services/business/cart.service';
import { NotificationService } from '../../../../core/services/shared/notification.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  loading: boolean = true;
  quantity: number = 1;

  // Objeto para armazenar as seleções das opções
  selectedOptions: { [key: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productDataService: ProductDataService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadProduct();
  }

  private loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      this.router.navigate(['/']);
      return;
    }

    this.loading = true;
    this.productDataService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        if (product) {
          // Corrigir: garantir que inStock seja calculado corretamente
          this.initializeDefaultSelections(product);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produto:', error);
        this.loading = false;
      }
    });
  }

  private initializeDefaultSelections(product: Product): void {
    // Inicializar seleções padrão para cada opção
    if (product.options) {
      product.options.forEach(option => {
        if (option.values && option.values.length > 0) {
          this.selectedOptions[option.name] = option.values[0];
        }
      });
    }
  }

  // Verificar se o produto tem opções
  hasProductOptions(): boolean {
    return !!(this.product?.options && this.product.options.length > 0);
  }

  // Verificar se uma opção específica está selecionada
  isOptionSelected(optionName: string, value: string): boolean {
    return this.selectedOptions[optionName] === value;
  }

  // Selecionar uma opção
  selectOption(optionName: string, value: string): void {
    this.selectedOptions[optionName] = value;
  }

  // Verificar se todas as opções obrigatórias foram selecionadas
  areAllOptionsSelected(): boolean {
    if (!this.product?.options) return true;

    return this.product.options.every(option =>
      this.selectedOptions[option.name] !== undefined
    );
  }

  // CORRIGIDO: Verificar se o produto está em estoque
  isProductInStock(): boolean {
    if (!this.product) return false;

    // Se não tem stockQuantity definido, assume que está em estoque
    if (this.product.stockQuantity === undefined || this.product.stockQuantity === null) {
      return true;
    }

    return this.product.stockQuantity > 0;
  }

  // Aumentar quantidade
  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  // Diminuir quantidade
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Adicionar ao carrinho
  addToCart(): void {
    if (this.product && this.isProductInStock() && this.areAllOptionsSelected()) {
      this.cartService.addToCart(
        this.product,
        this.quantity,
        this.selectedOptions
      );

      this.notificationService.showSuccess(
        `${this.product.name} adicionado ao carrinho! 🛒`
      );

    } else if (!this.areAllOptionsSelected()) {
      console.log('❌ Conditions not met:');
      console.log('   - Product:', !!this.product);
      console.log('   - In stock:', this.isProductInStock());
      console.log('   - All options selected:', this.areAllOptionsSelected());

      this.notificationService.showWarning(
        'Por favor, selecione todas as opções antes de adicionar ao carrinho.'
      );
    } else if (!this.isProductInStock()) {
      this.notificationService.showError(
        'Este produto está fora de estoque.'
      );
    }
  }

  // Voltar para a loja
  goBack(): void {
    this.router.navigate(['/']);
  }

  // Método auxiliar para o template
  getCategoryName(product: Product): string {
    return product.category.name;
  }
}