import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category',
  template: `
    <div class="category-page">
      <h2>Produtos da Categoria: {{ categoryId }}</h2>
      <!-- Aqui vai a lista de produtos por categoria -->
    </div>
  `,
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
  categoryId: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['categoryId'];
      // Carregar os produtos por categoria
    })
  }
}
