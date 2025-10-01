// features/products/components/test-product/test-product.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  template: `
    <h3>Teste ProductService</h3>
    <div *ngFor="let product of products">
      {{ product.name }} - R$ {{ product.price }}
    </div>
    <button (click)="testMethod()">Testar métodos</button>
<div *ngFor="let product of products">
  <h4>{{ product.name }}</h4>
  <p>Options: {{ product.options | json }}</p>
</div>
  `
})
export class TestProductComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.productService.getAll().subscribe(products => {
      this.products = products;
      console.log('Produtos carregados:', products);
    });
  }

  testMethod() {
    this.productService.getByCategory('aneis').subscribe(
      aneis => { console.log('Anéis:', aneis); }
    );

    this.productService.getById('1').subscribe(p => {
      console.log('Produto ID 1: ', p);
    });

    this.productService.searchProducts('anel').subscribe(result => {
      console.log('Busca "anel":', result);
    });
  }
}