import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Módulos
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { ProductsModule } from './features/products/products/products.module';
import { CartModule } from './features/cart/cart.module'
import { AppComponent } from './app.component';

// Componentes
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';



@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    ProductsModule,
    CartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
