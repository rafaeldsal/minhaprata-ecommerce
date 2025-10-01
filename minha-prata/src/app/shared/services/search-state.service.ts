import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from 'src/app/features/products/models/product';

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private searchTermSource = new BehaviorSubject<string>('');
  private searchResultsSource = new BehaviorSubject<Product[]>([]);
  private isSearchingSource = new BehaviorSubject<boolean>(false);

  currentSearchTerm$ = this.searchTermSource.asObservable();
  currentSearchResult$ = this.searchResultsSource.asObservable();
  isSearching$ = this.isSearchingSource.asObservable();

  setSearchTerm(term: string): void {
    this.searchTermSource.next(term);
  }

  setSearchResults(products: Product[]): void {
    this.searchResultsSource.next(products);
  }

  setIsSearching(searching: boolean): void {
    this.isSearchingSource.next(searching);
  }

  clearSearch(): void {
    this.searchTermSource.next('');
    this.searchResultsSource.next([]);
    this.setIsSearching(false);
  }

  get isSearching(): boolean {
    return this.isSearchingSource.value;
  }

  get searchTerm(): string {
    return this.searchTermSource.value;
  }
}
