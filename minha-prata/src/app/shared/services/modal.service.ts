import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModal = new BehaviorSubject<string | null>(null);
  activeModal$ = this.activeModal.asObservable();

  openLoginModal() {
    console.log('Abrindo modal de login');
    // 🎯 FUTURO: Lógica real de modal
  }

  openCartModal() {
    console.log('Abrindo modal do carrinho');
    // 🎯 FUTURO: Lógica real de modal
  }


  constructor() { }
}
