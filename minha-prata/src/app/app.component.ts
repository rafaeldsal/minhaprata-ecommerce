import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'minha-prata';

  selectedCategory: string = 'all';

  onCategorySelected(categorySlug: string): void {
    this.selectedCategory = categorySlug;
  }
}
