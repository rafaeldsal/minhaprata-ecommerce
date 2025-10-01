import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryStateService {

  private selectedCategorySubject = new BehaviorSubject<string>('all');
  public selectedCategory$ = this.selectedCategorySubject.asObservable();

  constructor() { }

  setSelectedCategory(categorySlug: string): void {
    console.log('CategoryStateService: Categoria selecionada:', categorySlug); // DEBUG
    this.selectedCategorySubject.next(categorySlug);
  }

  getSelectedCategory(): string {
    return this.selectedCategorySubject.value;
  }
}
