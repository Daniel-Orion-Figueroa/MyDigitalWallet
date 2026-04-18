import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentComponent } from './payment.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PaymentRoutingModule
  ],
  declarations: [PaymentComponent]
})
export class PaymentModule { }