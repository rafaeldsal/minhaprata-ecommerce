import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/layout/header/header.component';
import { FooterComponent } from '../shared/layout/footer/footer.component';
import { RouterModule } from '@angular/router';
import { CartModule } from 'src/app/features/cart/cart.module';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { PageContainerComponent } from '../shared/components/page-container/page-container.component';
import { SearchComponent } from '../shared/components/search/search.component';
import { PageNotFoundComponent } from '../shared/components/page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    PageContainerComponent,
    SearchComponent,
    PageNotFoundComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CartModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    PageContainerComponent,
    SearchComponent,
    PageNotFoundComponent
  ]
})
export class SharedModule { }
