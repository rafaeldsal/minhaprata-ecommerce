import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { ProductDetailsComponent } from './features/products/components/product-details/product-details.component';
import { CartPageComponent } from './features/cart/components/cart-page/cart-page.component';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/user/components/login/login.component';

const routes: Routes = [

  // Rotas públicas
  { path: '', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: 'categoria/:categoryId', loadChildren: () => import('./features/category/category.module').then(m => m.CategoryModule) },

  // Rotas protegidas
  { path: 'user', canActivate: [authGuard], loadChildren: () => import('./features/user/user.module').then(m => m.UserModule) },
  { path: 'address', canActivate: [authGuard], loadChildren: () => import('./features/address/address.module').then(m => m.AddressModule) },
  { path: 'checkout', canActivate: [authGuard], loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule) },


  { path: 'login', component: LoginComponent },
  { path: 'produto/:id', component: ProductDetailsComponent },
  { path: 'carrinho', component: CartPageComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
