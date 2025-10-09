import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { ProductDetailsComponent } from './features/products/components/product-details/product-details.component';
import { CartPageComponent } from './features/cart/components/cart-page/cart-page.component';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/user/components/login/login.component';
import { permissionGuard } from './core/guards/permission.guard';
import { adminGuard } from './core/guards/admin.guard';

const routes: Routes = [

  // Rotas públicas
  { path: '', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: 'categoria/:categoryId', loadChildren: () => import('./features/category/category.module').then(m => m.CategoryModule) },

  // Rotas protegidas
  { path: 'user', canActivate: [authGuard], loadChildren: () => import('./features/user/user.module').then(m => m.UserModule) },
  { path: 'address', canActivate: [authGuard], loadChildren: () => import('./features/address/address.module').then(m => m.AddressModule) },
  { path: 'checkout', canActivate: [authGuard, permissionGuard], loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule) },

  // Rotas de Administrador
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  // {
  //   path: 'admin/products',
  //   canActivate: [authGuard, permissionGuard],
  //   data: { permissions: ['canManageProducts'] },
  //   loadChildren: () => import('./features/admin/admin-products/admin-products.module').then(m => m.AdminProductsModule)
  // },
  // {
  //   path: 'admin/categories',
  //   canActivate: [authGuard, permissionGuard],
  //   data: { permissions: ['canManageCategories'] },
  //   loadChildren: () => import('./features/admin/admin-categories/admin-categories.module').then(m => m.AdminCategoriesModule)
  // },
  // {
  //   path: 'admin/users',
  //   canActivate: [authGuard, permissionGuard],
  //   data: { permissions: ['canManageUsers'] },
  //   loadChildren: () => import('./features/admin/admin-users/admin-users.module').then(m => m.AdminUsersModule)
  // },

  { path: 'login', component: LoginComponent },
  { path: 'produto/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartPageComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
