import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminProductsRoutingModule } from './admin-products-routing.module';
import { ProductCardAdminComponent } from './components/product-card-admin/product-card-admin.component';
import { ProductBulkActionsComponent } from './components/product-bulk-actions/product-bulk-actions.component';
import { ProductFiltersComponent } from './components/product-filters/product-filters.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ProductCardAdminComponent,
    ProductBulkActionsComponent,
    ProductFiltersComponent,
    ProductFormComponent,
    ProductListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminProductsRoutingModule,
    SharedModule
  ]
})
export class AdminProductsModule { }
