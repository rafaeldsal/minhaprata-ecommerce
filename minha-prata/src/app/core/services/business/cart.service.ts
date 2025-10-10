import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, CartState, CartHelper } from '../../models/order/cart.model';
import { Product, ProductHelper } from '../../models/product/product.model';
import { NotificationService } from '../shared/notification.service';
import { CategorySlug } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'minhaprata_cart';

  private cartSubject = new BehaviorSubject<CartState>(CartHelper.createInitialCartState());
  public cart$: Observable<CartState> = this.cartSubject.asObservable();

  constructor(
    private notificationService: NotificationService
  ) {
    this.loadFromStorage();
  }

  // ========== 🛒 MÉTODOS PÚBLICOS PRINCIPAIS ==========

  /**
   * Adiciona produto ao carrinho
   */
  addToCart(product: Product, quantity: number = 1, selectedOptions?: { [key: string]: string }): void {
    const currentState = this.cartSubject.value;

    // Valida o produto antes de adicionar
    const validation = CartHelper.validateCartItem({ product, quantity, selectedOptions } as CartItem);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      return;
    }

    const newItems = CartHelper.addOrUpdateItem(currentState.items, {
      product,
      quantity,
      selectedOptions,
      addedAt: new Date()
    });

    this.updateCartState(newItems);
  }

  /**
   * Remove produto do carrinho
   */
  removeFromCart(productId: string, selectedOptions?: { [key: string]: string }): void {
    const currentState = this.cartSubject.value;
    const newItems = CartHelper.removeItem(currentState.items, productId, selectedOptions);

    this.updateCartState(newItems);
    this.notificationService.showInfo('Item removido do carrinho 🗑️');
  }

  /**
   * Atualiza quantidade de um produto no carrinho
   */
  updateQuantity(productId: string, quantity: number, selectedOptions?: { [key: string]: string }): void {
    if (quantity <= 0) {
      this.removeFromCart(productId, selectedOptions);
      return;
    }

    const currentState = this.cartSubject.value;
    const newItems = CartHelper.updateItemQuantity(currentState.items, productId, selectedOptions, quantity);

    this.updateCartState(newItems);
  }

  /**
   * Limpa todo o carrinho
   */
  clearCart(): void {
    this.updateCartState([]);
    this.notificationService.showInfo('Carrinho limpo 🗑️');
  }

  /**
   * Adiciona múltiplos itens ao carrinho
   */
  addMultipleToCart(items: { product: Product, quantity: number, selectedOptions?: { [key: string]: string } }[]): void {
    const currentState = this.cartSubject.value;
    let newItems = [...currentState.items];

    items.forEach(newItem => {
      const validation = CartHelper.validateCartItem({
        product: newItem.product,
        quantity: newItem.quantity,
        selectedOptions: newItem.selectedOptions
      } as CartItem);

      if (validation.isValid) {
        newItems = CartHelper.addOrUpdateItem(newItems, {
          product: newItem.product,
          quantity: newItem.quantity,
          selectedOptions: newItem.selectedOptions,
          addedAt: new Date()
        });
      } else {
        console.warn(`Item inválido não adicionado: ${newItem.product.name}`, validation.errors);
      }
    });

    this.updateCartState(newItems);
    this.notificationService.showSuccess(`${items.length} item(ns) adicionado(s) ao carrinho! 🛒`);
  }

  // ========== 🔍 MÉTODOS DE CONSULTA ==========

  /**
   * Retorna quantidade total de itens no carrinho
   */
  getItemsCount(): number {
    return this.cartSubject.value.itemsCount;
  }

  /**
   * Retorna preço total do carrinho
   */
  getTotalPrice(): number {
    return this.cartSubject.value.total;
  }

  /**
   * Retorna quantidade de um produto específico
   */
  getItemQuantity(productId: string, selectedOptions?: { [key: string]: string }): number {
    const item = this.cartSubject.value.items.find(item =>
      item.product.id === productId &&
      CartHelper.areOptionsEqual(item.selectedOptions, selectedOptions)
    );
    return item ? item.quantity : 0;
  }

  /**
   * Verifica se produto está no carrinho
   */
  isProductInCart(productId: string, selectedOptions?: { [key: string]: string }): boolean {
    return this.cartSubject.value.items.some(item =>
      item.product.id === productId &&
      CartHelper.areOptionsEqual(item.selectedOptions, selectedOptions)
    );
  }

  /**
   * Retorna resumo do carrinho (subtotal, frete, total)
   */
  getCartSummary() {
    return CartHelper.getCartSummary(this.cartSubject.value.items);
  }

  /**
   * Retorna todos os itens do carrinho
   */
  getCartItems(): CartItem[] {
    return [...this.cartSubject.value.items];
  }

  /**
   * Verifica se o carrinho está vazio
   */
  isEmpty(): boolean {
    return this.cartSubject.value.items.length === 0;
  }

  // ========== 🎁 MÉTODOS DE PROMOÇÃO/DESCONTO ==========

  /**
   * Aplica cupom de desconto (para implementação futura)
   */
  applyDiscountCode(code: string): { success: boolean; message: string; discount?: number } {
    // TODO: Implementar lógica de cupons
    console.log('Aplicando cupom:', code);

    // Mock por enquanto
    if (code === 'MINHAPRATA10') {
      const discount = this.cartSubject.value.total * 0.1; // 10% de desconto
      this.notificationService.showSuccess(`Cupom aplicado! Desconto de ${ProductHelper.formatPrice(discount)}`);
      return { success: true, message: 'Cupom aplicado com sucesso', discount };
    }

    this.notificationService.showError('Cupom inválido ou expirado');
    return { success: false, message: 'Cupom inválido' };
  }

  /**
   * Calcula frete (mock - integrar com API de frete depois)
   */
  calculateShipping(zipCode: string): { price: number; days: number; name: string } {
    // TODO: Integrar com API de cálculo de frete
    const total = this.cartSubject.value.total;

    if (total > 100) {
      return { price: 0, days: 5, name: 'Frete Grátis' };
    } else if (total > 50) {
      return { price: 9.90, days: 3, name: 'Entrega Econômica' };
    } else {
      return { price: 14.90, days: 2, name: 'Entrega Expressa' };
    }
  }

  // ========== 💾 MÉTODOS PRIVADOS - STORAGE ==========

  /**
   * Atualiza estado do carrinho e salva no storage
   */
  private updateCartState(items: CartItem[]): void {
    const total = CartHelper.calculateCartTotal(items);
    const itemsCount = CartHelper.calculateItemsCount(items);

    const newState: CartState = {
      items,
      total,
      itemsCount
    };

    this.cartSubject.next(newState);
    this.saveToStorage(newState);
  }

  /**
   * Salva carrinho no localStorage
   */
  private saveToStorage(state: CartState): void {
    try {
      const storageState = {
        ...state,
        items: state.items.map(item => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
          // Converte Product para formato serializável se necessário
          product: {
            ...item.product,
            // Remove métodos ou propriedades não serializáveis
          }
        }))
      };
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(storageState));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }

  /**
   * Carrega carrinho do localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        const state: CartState = {
          ...parsedState,
          items: parsedState.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
            // Reconstroi objeto Product se necessário
            product: item.product as Product
          }))
        };

        // Valida itens carregados do storage
        const validItems = state.items.filter(item =>
          CartHelper.validateCartItem(item).isValid
        );

        if (validItems.length !== state.items.length) {
          console.warn('Alguns itens inválidos foram removidos do carrinho');
        }

        this.updateCartState(validItems);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
      this.clearStorage();
    }
  }

  /**
   * Limpa storage do carrinho
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(this.CART_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar storage do carrinho:', error);
    }
  }

  // ========== 🧪 MÉTODOS PARA DESENVOLVIMENTO ==========

  /**
   * Adiciona itens mock para testes
   */
  addMockItems(): void {
    const mockProducts: Product[] = [
      {
        id: 'mock-1',
        name: 'Anel de Prata Sterling',
        description: 'Anel elegante em prata 925',
        price: 89.90,
        imgUrl: 'https://via.placeholder.com/150',
        stockQuantity: 10,
        dtCreated: new Date().toISOString(),
        dtUpdated: new Date().toISOString(),
        category: {
          id: '1', 
          name: 'aneis', 
          description: 'Anéis', 
          slug: CategorySlug.ANEIS, 
          isActive: true,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      {
        id: 'mock-2',
        name: 'Colar Coração',
        description: 'Colar delicado com pingente de coração',
        price: 129.90,
        imgUrl: 'https://via.placeholder.com/150',
        stockQuantity: 5,
        dtCreated: new Date().toISOString(),
        dtUpdated: new Date().toISOString(),
        category: { 
          id: '2', 
          name: 'colares', 
          description: 'Colares', 
          slug: CategorySlug.COLARES,
          isActive: true,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    ];

    this.addMultipleToCart([
      { product: mockProducts[0], quantity: 1 },
      { product: mockProducts[1], quantity: 2 }
    ]);
  }

  /**
   * Loga estado atual do carrinho (para debugging)
   */
  logCartState(): void {
    console.log('🛒 Estado do Carrinho:', this.cartSubject.value);
  }
}