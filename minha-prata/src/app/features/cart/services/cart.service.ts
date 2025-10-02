import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, CartState } from '../models/cart-item';
import { Product } from '../../products/models/product';
import { NotificationService } from 'src/app/core/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'minhaprata_cart';

  private cartSubject = new BehaviorSubject<CartState>(this.getInitialState());
  public cart$: Observable<CartState> = this.cartSubject.asObservable();

  constructor(
    private notificationService: NotificationService
  ) {
    this.loadFromStorage();
  }

  // Métodos públicos principais
  addToCart(product: Product, quantity: number = 1, selectedOptions?: { [key: string]: string }): void {
    const currentState = this.cartSubject.value;
    const existingItemIndex = this.findCartItemIndex(currentState.items, product, selectedOptions);

    let newItems: CartItem[];

    if (existingItemIndex > -1) {
      newItems = [...currentState.items];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + quantity
      };
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        selectedOptions,
        addedAt: new Date()
      };
      newItems = [...currentState.items, newItem];
    }

    this.updateCartState(newItems);
  }

  removeFromCart(productId: string, selectedOptions?: { [key: string]: string }): void {
    const currentState = this.cartSubject.value;
    const newItems = currentState.items.filter(item =>
      !(item.product.id === productId && this.areOptionsEqual(item.selectedOptions, selectedOptions))
    );

    this.updateCartState(newItems);
    this.notificationService.showInfo('Item removido do carrinho 🗑️');
  }

  updateQuantity(productId: string, quantity: number, selectedOptions?: { [key: string]: string }): void {
    if (quantity <= 0) {
      this.removeFromCart(productId, selectedOptions);
      return;
    }

    const currentState = this.cartSubject.value;
    const itemIndex = this.findCartItemIndex(currentState.items, { id: productId } as Product, selectedOptions);

    if (itemIndex > -1) {
      const newItems = [...currentState.items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        quantity
      };

      this.updateCartState(newItems);
    }
  }

  clearCart(): void {
    this.updateCartState([]);
    this.notificationService.showInfo('Item(ns) removido(s) do carrinho 🗑️');
  }

  getItemsCount(): number {
    return this.cartSubject.value.itemsCount;
  }

  getTotalPrice(): number {
    return this.cartSubject.value.total;
  }

  // Novos métodos úteis
  getItemQuantity(productId: string, selectedOptions?: { [key: string]: string }): number {
    const item = this.cartSubject.value.items.find(item =>
      item.product.id === productId && this.areOptionsEqual(item.selectedOptions, selectedOptions)
    );
    return item ? item.quantity : 0;
  }

  isProductInCart(productId: string, selectedOptions?: { [key: string]: string }): boolean {
    return this.cartSubject.value.items.some(item =>
      item.product.id === productId && this.areOptionsEqual(item.selectedOptions, selectedOptions)
    );
  }

  // Métodos privados
  private updateCartState(items: CartItem[]): void {
    const total = this.calculateTotal(items);
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const newState: CartState = {
      items,
      total,
      itemsCount
    };

    this.cartSubject.next(newState);
    this.saveToStorage(newState);
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  private findCartItemIndex(
    items: CartItem[],
    product: Product,
    selectedOptions?: { [key: string]: string }
  ): number {
    return items.findIndex(item =>
      item.product.id === product.id &&
      this.areOptionsEqual(item.selectedOptions, selectedOptions)
    );
  }

  private areOptionsEqual(opts1?: { [key: string]: string }, opts2?: { [key: string]: string }): boolean {
    if (!opts1 && !opts2) return true;
    if (!opts1 || !opts2) return false;

    const keys1 = Object.keys(opts1);
    const keys2 = Object.keys(opts2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => opts1[key] === opts2[key]);
  }

  private saveToStorage(state: CartState): void {
    try {
      const storageState = {
        ...state,
        items: state.items.map(item => ({
          ...item,
          addedAt: item.addedAt.toISOString()
        }))
      };
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(storageState));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        const state: CartState = {
          ...parsedState,
          items: parsedState.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        };
        this.cartSubject.next(state);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
      localStorage.removeItem(this.CART_STORAGE_KEY);
    }
  }

  private getInitialState(): CartState {
    return {
      items: [],
      total: 0,
      itemsCount: 0
    };
  }
}