import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category, CategorySlug } from 'src/app/shared/models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  categories: Category[] = [
    { name: 'Todos', slug: CategorySlug.ALL, icon: 'fa-solid fa-gem' },
    { name: 'Anéis', slug: CategorySlug.ANEIS, icon: 'fa-regular fa-circle' },
    { name: 'Brincos', slug: CategorySlug.BRINCOS, icon: 'fa-solid fa-gem' },
    { name: 'Braceletes', slug: CategorySlug.BRACELETES, icon: 'fa-solid fa-link' },
    { name: 'Colares', slug: CategorySlug.COLARES, icon: 'fa-solid fa-necklace' }
  ];

  constructor() { }

  getAllCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  getCategoryBySlug(slug: string): Observable<Category | undefined> {
    const category = this.categories.find(cat => cat.slug === slug);
    return of(category);
  }

  getCategorySlugFromName(categoryName: string): string {
    const mapping: { [key: string]: string } = {
      'aneis': CategorySlug.ANEIS,
      'brincos': CategorySlug.BRINCOS,
      'braceletes': CategorySlug.BRACELETES,
      'colares': CategorySlug.COLARES
    };

    return mapping[categoryName] || CategorySlug.ALL;
  }
}
