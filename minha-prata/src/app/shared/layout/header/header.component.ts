import { Component, EventEmitter, OnInit, Output, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/shared/notification.service';
import { ProductDataService } from 'src/app/core/services/data/product-data.service';
import { Category, CategorySlug } from 'src/app/core/models';
import { SearchService } from 'src/app/core/services/business/search.service';
import { CategoryDataService } from 'src/app/core/services/data/category-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() categorySelected = new EventEmitter<string>();

  categories: Category[] = [];
  activeCategory: CategorySlug | string = CategorySlug.ALL;
  isMobileMenuOpen = false;

  constructor(
    private router: Router,
    private productDataService: ProductDataService,
    private categoryDataService: CategoryDataService,
    private notificationService: NotificationService,
    private searchService: SearchService
  ) { }

  ngOnInit(): void {
    this.searchService.clearSearch();
    this.loadCategories();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  loadCategories(): void {
    this.categoryDataService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias: ', error);
      }
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateBodyScroll();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }

  onMobileCategorySelect(category: Category): void {
    this.onCategorySelect(category);
    this.closeMobileMenu();
  }

  onLogoClick(): void {
    this.router.navigate(['/']);
    this.activeCategory = CategorySlug.ALL;
    this.categorySelected.emit(CategorySlug.ALL);
    this.searchService.clearSearch();
    this.closeMobileMenu();
  }

  onCategorySelect(category: Category): void {
    const categorySlug = category.slug || CategorySlug.ALL;
    this.activeCategory = categorySlug;
    this.categorySelected.emit(category.slug);
    this.searchService.clearSearch();

    if (category.slug === CategorySlug.ALL) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/categoria', category.slug]);
    }
    this.notificationService.showInfo(`Mostrando ${category.name} 📦`);
  }

  trackByCategory(index: number, category: Category): string {
    return category.slug || `category-${index}`;
  }

  onCartClick(): void {
    this.router.navigate(['/carrinho']);
  }
}