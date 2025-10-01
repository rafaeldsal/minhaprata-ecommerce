import { Component } from '@angular/core';
import { Product } from '../products/models/product';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  selectedCategory: string = 'all';

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
