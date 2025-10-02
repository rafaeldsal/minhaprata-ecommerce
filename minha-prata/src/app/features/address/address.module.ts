import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressComponent } from './components/address/address.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { AddressListComponent } from './components/address-list/address-list.component';
import { AddressSelectComponent } from './components/address-select/address-select.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  { path: '', component: AddressComponent },
  { path: 'new', component: AddressFormComponent },
  { path: 'edit/:id', component: AddressFormComponent }
];

@NgModule({
  declarations: [
    AddressComponent,
    AddressFormComponent,
    AddressListComponent,
    AddressSelectComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AddressModule { }
