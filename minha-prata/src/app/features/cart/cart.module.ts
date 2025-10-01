import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartIconComponent } from './components/cart-icon/cart-icon.component';
import { CartItemComponent } from './components/cart-item/cart-item.component';
import { CartPageComponent } from './components/cart-page/cart-page.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'carrinho', component: CartPageComponent }
]

@NgModule({
  declarations: [
    CartIconComponent,
    CartItemComponent,
    CartPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    CartIconComponent
  ]
})
export class CartModule { }
