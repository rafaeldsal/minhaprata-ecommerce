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
import { UserModule } from '../features/user/user.module';
import { UserAuthIconComponent } from './components/user-auth-icon/user-auth-icon.component';
import { CartIconComponent } from '../features/cart/components/cart-icon/cart-icon.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    PageContainerComponent,
    SearchComponent,
    PageNotFoundComponent,
    UserAuthIconComponent,
    CartIconComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    PageContainerComponent,
    SearchComponent,
    UserAuthIconComponent,
    PageNotFoundComponent,
    CartIconComponent
  ]
})
export class SharedModule { }
