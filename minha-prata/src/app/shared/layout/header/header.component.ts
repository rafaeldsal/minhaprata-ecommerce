import { Component, EventEmitter, OnInit, Output, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Category, CategorySlug } from '../../models/category';
import { ModalService } from '../../../core/services/modal.service';
import { CategoryService } from 'src/app/features/products/services/category.service';
import { SearchStateService } from 'src/app/core/services/search-state.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() categorySelected = new EventEmitter<string>();

  categories: Category[] = [];
  activeCategory = CategorySlug.ALL;
  isMobileMenuOpen = false;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private searchStateService: SearchStateService
  ) { }

  ngOnInit(): void {
    this.searchStateService.clearSearch();
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
    this.categoryService.getAllCategories().subscribe({
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
    this.searchStateService.clearSearch();
    this.closeMobileMenu();
  }

  onCategorySelect(category: Category): void {
    this.activeCategory = category.slug;
    this.categorySelected.emit(category.slug);
    this.searchStateService.clearSearch();

    if (category.slug === CategorySlug.ALL) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/categoria', category.slug]);
    }
    this.notificationService.showInfo(`Mostrando ${category.name} 📦`);
  }

  trackByCategory(index: number, category: Category): string {
    return category.slug;
  }

  onUserClick(): void {
    this.modalService.openLoginModal();
  }

  onCartClick(): void {
    this.router.navigate(['/carrinho']);
  }
}