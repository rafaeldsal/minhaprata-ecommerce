import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Category, CategorySlug } from '../../models/category';
import { ModalService } from '../../services/modal.service';
import { CategoryService } from 'src/app/features/products/services/category.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() categorySelected = new EventEmitter<string>();
  @Output() searchChanged = new EventEmitter<string>();

  categories: Category[] = [];
  activeCategory = CategorySlug.ALL;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
      this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories
      },
      error: (error) => {
        console.error('Erro ao carregar categorias: ', error);
      }
    });
  }

  onLogoClick() {
    this.router.navigate(['/']);
    this.activeCategory = CategorySlug.ALL;
    this.categorySelected.emit(CategorySlug.ALL);
  }

  onCategorySelect(category: Category) {
    this.activeCategory = category.slug;
    this.categorySelected.emit(category.slug);

    if (category.slug === CategorySlug.ALL) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/categoria', category.slug]);
    }
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
