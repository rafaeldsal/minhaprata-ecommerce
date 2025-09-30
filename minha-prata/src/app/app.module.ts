import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductListComponent } from './features/products/components/product-list/product-list.component';
import { ProductCardComponent } from './features/products/components/product-card/product-card.component';
import { HeaderComponent } from './shared/layout/header/header.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { SharedModule } from './shared/shared/shared.module';
import { HomeComponent } from './features/home/home.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { AddressComponent } from './features/address/address.component';
import { UserSettingsComponent } from './features/user/user-settings/user-settings.component';
import { LoginComponent } from './features/user/login/login.component';
import { AddressFormComponent } from './features/address/address-form/address-form.component';
import { AddressListComponent } from './features/address/address-list/address-list.component';
import { AddressSelectComponent } from './features/address/address-select/address-select.component';
import { PaymentFormComponent } from './features/checkout/payment-form/payment-form.component';
import { ProductsModule } from './features/products/products/products.module';

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductCardComponent,
    HomeComponent,
    CheckoutComponent,
    AddressComponent,
    UserSettingsComponent,
    LoginComponent,
    AddressFormComponent,
    AddressListComponent,
    AddressSelectComponent,
    PaymentFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    ProductsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
