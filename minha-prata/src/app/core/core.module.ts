import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './services/modal.service';
import { NotificationService } from './services/notification.service';
import { SearchStateService } from './services/search-state.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    ModalService,
    NotificationService,
    SearchStateService
  ]
})
export class CoreModule { }
