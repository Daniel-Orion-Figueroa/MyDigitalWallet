import { ComponentRef, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

export interface ModalOptions {
  component: ComponentRef<any>;
  componentProps?: { [key: string]: any };
  presentingElement?: HTMLElement;
  showBackdrop?: boolean;
  backdropDismiss?: boolean;
  cssClass?: string;
  animated?: boolean;
  swipeToClose?: boolean;
  mode?: 'ios' | 'md';
  keyboardClose?: boolean;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(private modalController: ModalController) {}

  // Create and present modal
  async show(options: ModalOptions): Promise<HTMLIonModalElement> {
    const modal = await this.modalController.create({
      component: options.component,
      componentProps: options.componentProps,
      presentingElement: options.presentingElement,
      showBackdrop: options.showBackdrop !== false,
      backdropDismiss: options.backdropDismiss !== false,
      cssClass: options.cssClass,
      animated: options.animated !== false,
      swipeToClose: options.swipeToClose || false,
      mode: options.mode,
      keyboardClose: options.keyboardClose !== false,
      id: options.id
    });

    await modal.present();
    return modal;
  }

  // Dismiss modal
  async dismiss(data?: any, role?: string, id?: string): Promise<void> {
    await this.modalController.dismiss(data, role, id);
  }

  // Dismiss all modals
  async dismissAll(): Promise<void> {
    await this.modalController.dismiss();
  }

  // Get top modal
  async getTop(): Promise<HTMLIonModalElement | null> {
    return await this.modalController.getTop();
  }

  // Show card details modal
  async showCardDetails(cardId: string): Promise<HTMLIonModalElement> {
    const { CardDetailsModalComponent } = await import('../../shared/components/card-details-modal/card-details-modal.component');
    return this.show({
      component: CardDetailsModalComponent,
      componentProps: { cardId },
      cssClass: 'card-details-modal'
    });
  }

  // Show transaction details modal
  async showTransactionDetails(transactionId: string): Promise<HTMLIonModalElement> {
    const { TransactionDetailsModalComponent } = await import('../../shared/components/transaction-details-modal/transaction-details-modal.component');
    return this.show({
      component: TransactionDetailsModalComponent,
      componentProps: { transactionId },
      cssClass: 'transaction-details-modal'
    });
  }

  // Show add card modal
  async showAddCard(): Promise<HTMLIonModalElement> {
    const { AddCardModalComponent } = await import('../../shared/components/add-card-modal/add-card-modal.component');
    return this.show({
      component: AddCardModalComponent,
      cssClass: 'add-card-modal'
    });
  }

  // Show payment modal
  async showPayment(cardId?: string): Promise<HTMLIonModalElement> {
    const { PaymentModalComponent } = await import('../../shared/components/payment-modal/payment-modal.component');
    return this.show({
      component: PaymentModalComponent,
      componentProps: { cardId },
      cssClass: 'payment-modal'
    });
  }

  // Show settings modal
  async showSettings(): Promise<HTMLIonModalElement> {
    const { SettingsModalComponent } = await import('../../shared/components/settings-modal/settings-modal.component');
    return this.show({
      component: SettingsModalComponent,
      cssClass: 'settings-modal'
    });
  }

  // Show help modal
  async showHelp(): Promise<HTMLIonModalElement> {
    const { HelpModalComponent } = await import('../../shared/components/help-modal/help-modal.component');
    return this.show({
      component: HelpModalComponent,
      cssClass: 'help-modal'
    });
  }

  // Show confirmation modal
  async showConfirmation(
    title: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const { ConfirmationModalComponent } = await import('../../shared/components/confirmation-modal/confirmation-modal.component');
      const modal = await this.show({
        component: ConfirmationModalComponent,
        componentProps: {
          title,
          message,
          confirmText,
          cancelText,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        },
        cssClass: 'confirmation-modal'
      });

      modal.onDidDismiss().then(() => resolve(false));
    });
  }

  // Show image preview modal
  async showImagePreview(imageUrl: string, title?: string): Promise<HTMLIonModalElement> {
    const { ImagePreviewModalComponent } = await import('../../shared/components/image-preview-modal/image-preview-modal.component');
    return this.show({
      component: ImagePreviewModalComponent,
      componentProps: { imageUrl, title },
      cssClass: 'image-preview-modal'
    });
  }

  // Show QR code modal
  async showQRCode(data: string, title?: string): Promise<HTMLIonModalElement> {
    const { QrCodeModalComponent } = await import('../../shared/components/qr-code-modal/qr-code-modal.component');
    return this.show({
      component: QrCodeModalComponent,
      componentProps: { data, title },
      cssClass: 'qr-code-modal'
    });
  }
}