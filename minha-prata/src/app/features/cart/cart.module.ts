import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItemComponent } from './components/cart-item/cart-item.component';
import { CartPageComponent } from './components/cart-page/cart-page.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    CartItemComponent,
    CartPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
  ]
})
export class CartModule { }
