import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../products/models/product';
import { Subscription } from 'rxjs';
import { CategoryStateService } from '../../shared/services/category-state.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedCategory: string = 'all';
  private categorySubscription!: Subscription;

  constructor(
    private categoryStateService: CategoryStateService
  ) { }

  ngOnInit(): void {
    // Escute mudanças de categoria
    this.categorySubscription = this.categoryStateService.selectedCategory$.subscribe(
      categorySlug => {
        console.log('HomeComponent: Categoria recebida:', categorySlug); // DEBUG
        this.selectedCategory = categorySlug;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

  onSearchChange(searchTerm: string): void {
    console.log('Usuário buscou por:', searchTerm);
    // Aqui você pode fazer algo com o termo de busca
    // Ex: atualizar outros componentes, fazer tracking, etc.
  }

  onProductSelect(product: Product): void {
    console.log('Produto selecionado:', product);
    // Navegar para a página do produto
    // this.router.navigate(['/produto', product.id]);
  }
}
