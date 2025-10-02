import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: CheckoutComponent },
  { path: 'payment', component: PaymentFormComponent }
];

@NgModule({
  declarations: [
    CheckoutComponent,
    PaymentFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class CheckoutModule { }
