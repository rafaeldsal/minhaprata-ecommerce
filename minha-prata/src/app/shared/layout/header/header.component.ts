import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/features/products/services/product.service';
import { Category, CategorySlug } from '../../models/category';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Output() categorySelected = new EventEmitter<string>();
  @Output() searchChanged = new EventEmitter<string>();

  categories: Category[] = [
    { name: 'Todos', slug: CategorySlug.ALL, icon: 'fa-solid fa-gem' },
    { name: 'Anéis', slug: CategorySlug.ANEIS, icon: 'fa-regular fa-circle' },
    { name: 'Brincos', slug: CategorySlug.BRINCOS, icon: 'fa-solid fa-gem' },
    { name: 'Braceletes', slug: CategorySlug.BRACELETES, icon: 'fa-solid fa-link' },
    { name: 'Colares', slug: CategorySlug.COLARES, icon: 'fa-solid fa-necklace' }
  ];
  activeCategory = CategorySlug.ALL;

  constructor(
    private router: Router,
    private productService: ProductService,
    private modalService: ModalService
  ) { }

  onLogoClick() {
    this.router.navigate(['/']);
    this.activeCategory = CategorySlug.ALL;
  }

  onCategorySelect(category: Category) {
    this.activeCategory = category.slug;
    this.categorySelected.emit(category.slug);
  }

  trackByCategory(index: number, category: Category): string {
    return category.slug;
  }

  onUserClick() {
    this.modalService.openLoginModal();
  }

  onCartClick() {
    this.modalService.openCartModal();
  }

  onSearchChange(searchTerm: string) {
    this.searchChanged.emit(searchTerm);
  }

}
