import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: 'categoria/:categoryId', loadChildren: () => import('./features/category/category.module').then(m => m.CategoryModule) },
  { path: 'produto/:id', loadChildren: () => import('./features/products/pages/product-details/product-details.module').then(m => m.ProductDetailsModule) },
  { path: 'carrinho', loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule) },


  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
