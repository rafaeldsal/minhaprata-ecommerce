import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent implements OnInit, OnChanges {
  @Input() categoryFilter: string = 'all';
  products: Product[] = [];
  loading: boolean = true;

  constructor(
    private productService: ProductService,
    private router: ActivatedRoute
  ) { }

  ngOnInit() {
    this.router.params.subscribe(params => {
      const categorySlug = params['categoryId'];
      if (categorySlug) {
        this.loadProductsByCategory(categorySlug);
      } else {
        this.loadAllProducts();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryFilter']) {
      this.loadProductsByCategory(this.categoryFilter);
    }
  }

  loadAllProducts(): void {
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

  loadProductsByCategory(categorySlug: string): void {
    this.loading = true;
    this.productService.getByCategory(categorySlug).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao filtrar produtos:', error);
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
