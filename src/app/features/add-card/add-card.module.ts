import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddCardRoutingModule } from './add-card-routing.module';
import { AddCardComponent } from './add-card.component';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddCardRoutingModule,
    SharedModule
  ],
  declarations: [AddCardComponent]
})
export class AddCardModule { }