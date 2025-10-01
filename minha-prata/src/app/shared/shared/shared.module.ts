import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { RouterModule } from '@angular/router';
import { CartModule } from 'src/app/features/cart/cart.module';
import { ToastComponent } from '../components/toast/toast.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ToastComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CartModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    ToastComponent
  ]
})
export class SharedModule { }
