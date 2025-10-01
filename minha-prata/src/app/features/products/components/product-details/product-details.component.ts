import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductOption } from '../../models/product';
import { ProductService } from '../../services/product.service';
// import { CartService } from '../../../cart/services/cart.service';

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
    private productService: ProductService,
    // private cartService: CartService
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
    this.productService.getById(productId).subscribe({
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
      const productToAdd = {
        ...this.product,
        selectedOptions: { ...this.selectedOptions },
        quantity: this.quantity
      };

      // this.cartService.addToCart(productToAdd, this.quantity);
      console.log('Produto adicionado ao carrinho:', this.product.name);

      // Opcional: mostrar mensagem de sucesso
      alert(`${this.product.name} adicionado ao carrinho!`);
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