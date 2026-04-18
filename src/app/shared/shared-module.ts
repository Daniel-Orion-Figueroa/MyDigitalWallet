import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Importar componentes Ionic
import { IonicModule } from '@ionic/angular';

// Importar componentes
import { BalanceDisplayComponent } from './components/balance-display.component';
import { CalendarComponent } from './components/calendar.component';
import { CardComponent } from './components/card.component';
import { CustomInputComponent } from './components/custom-input.component';
import { PaymentSimulatorComponent } from './components/payment-simulator.component';
import { QuickActionsComponent } from './components/quick-actions.component';
import { SkeletonLoadingComponent } from './components/skeleton-loading.component';
import { TransactionItemComponent } from './components/transaction-item.component';
import { TransactionListComponent } from './components/transaction-list.component';

// Importar pipes
import { CardNumberPipe } from './pipes/card-number.pipe';

@NgModule({
  declarations: [
    CardComponent,
    TransactionListComponent,
    TransactionItemComponent,
    BalanceDisplayComponent,
    QuickActionsComponent,
    CustomInputComponent,
    PaymentSimulatorComponent,
    SkeletonLoadingComponent,
    CalendarComponent,
    CardNumberPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IonicModule,
    
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    CardComponent,
    TransactionListComponent,
    TransactionItemComponent,
    BalanceDisplayComponent,
    QuickActionsComponent,
    CustomInputComponent,
    PaymentSimulatorComponent,
    SkeletonLoadingComponent,
    CalendarComponent,
    CardNumberPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
