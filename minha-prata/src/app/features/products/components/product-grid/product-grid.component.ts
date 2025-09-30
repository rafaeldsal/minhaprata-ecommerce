import { Component } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent {

  products: Product[] = [];
  loading: boolean = true;

  constructor(
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error ao carregar produtos: ', error);
        this.loading = false;
      }
    });
  }

  onViewDetails(productId: string): void {
    console.log('Abrir detalhes do produto:', productId);
    // Aqui você vai implementar a navegação para o modal de detalhes
    // Por enquanto só vamos logar
  }

  onAddToCart(product: Product): void {
    console.log('Adicionar ao carrinho:', product);
    // Aqui você vai implementar a lógica do carrinho
    // Por enquanto só vamos logar
  }
}
