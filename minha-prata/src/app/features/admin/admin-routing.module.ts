import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { adminGuard } from 'src/app/core/guards/admin.guard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  {
    path: '', component: AdminLayoutComponent, canActivate: [adminGuard], children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'products', loadChildren: () => import('./admin-products/admin-products.module').then(m => m.AdminProductsModule) },
      { path: 'categories', loadChildren: () => import('./admin-categories/admin-categories.module').then(m => m.AdminCategoriesModule) },
      // { path: 'users', loadChildren: () => import('./admin-users/admin-users.module').then(m => m.AdminUsersModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
