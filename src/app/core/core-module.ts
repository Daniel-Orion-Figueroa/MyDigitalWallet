import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AutoLoginGuard } from './guards/auto-login.guard';

// Services
import { AuthService } from './services/auth.service';
import { BiometricService } from './services/biometric.service';
import { CardService } from './services/card.service';
import { DialogService } from './services/dialog.service';
import { FirestoreService } from './services/firestore.service';
import { HttpService } from './services/http.service';
import { LoadingService } from './services/loading.service';
import { ModalService } from './services/modal.service';
import { NotificationService } from './services/notification.service';
import { PaymentService } from './services/payment.service';
import { ToastService } from './services/toast.service';
import { UserService } from './services/user.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Guards
    AuthGuard,
    AutoLoginGuard,

    // Services
    AuthService,
    BiometricService,
    FirestoreService,
    UserService,
    CardService,
    PaymentService,
    NotificationService,
    ToastService,
    DialogService,
    LoadingService,
    ModalService,
    HttpService
  ]
})
export class CoreModule { }
