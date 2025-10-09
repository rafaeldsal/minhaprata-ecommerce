import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { HttpClientModule } from '@angular/common/http';
import { UserOrdersComponent } from './components/user-orders/user-orders.component';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { SettingsAccountComponent } from './components/settings-account/settings-account.component';
import { SettingsPrivacyComponent } from './components/settings-privacy/settings-privacy.component';
import { SettingsNotificationsComponent } from './components/settings-notifications/settings-notifications.component';
import { SettingsDevicesComponent } from './components/settings-devices/settings-devices.component';
import { SettingsDangerZoneComponent } from './components/settings-danger-zone/settings-danger-zone.component';

const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' }, // ← Rota padrão
  { path: 'settings', component: UserSettingsComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'orders', component: UserOrdersComponent },
  { path: 'orders/:id', component: OrderDetailsComponent }
];

@NgModule({
  declarations: [
    LoginComponent,
    UserSettingsComponent,
    UserProfileComponent,
    UserOrdersComponent,
    OrderCardComponent,
    OrderDetailsComponent,
    SettingsAccountComponent,
    SettingsPrivacyComponent,
    SettingsNotificationsComponent,
    SettingsDevicesComponent,
    SettingsDangerZoneComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class UserModule { }
