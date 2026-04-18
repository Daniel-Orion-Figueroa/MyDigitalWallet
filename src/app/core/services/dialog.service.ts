import { Injectable } from '@angular/core';
import { AlertController, ActionSheetController, PopoverController } from '@ionic/angular';

export interface DialogOptions {
  header?: string;
  subHeader?: string;
  message?: string;
  inputs?: any[];
  buttons?: any[];
  cssClass?: string;
  backdropDismiss?: boolean;
  translucent?: boolean;
}

export interface ActionSheetOptions {
  header?: string;
  subHeader?: string;
  cssClass?: string;
  buttons: any[];
  backdropDismiss?: boolean;
  translucent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private popoverController: PopoverController
  ) {}

  // Show alert dialog
  async showAlert(options: DialogOptions): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      header: options.header,
      subHeader: options.subHeader,
      message: options.message,
      inputs: options.inputs,
      buttons: options.buttons || ['OK'],
      cssClass: options.cssClass,
      backdropDismiss: options.backdropDismiss,
      translucent: options.translucent
    });
    await alert.present();
    return alert;
  }

  // Show confirmation dialog
  async showConfirmation(
    message: string,
    header: string = 'Confirmar',
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: confirmText,
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }

  // Show input dialog
  async showInput(
    message: string,
    header: string = 'Ingrese información',
    placeholder: string = '',
    inputType: string = 'text',
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<string | null> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        inputs: [
          {
            name: 'input',
            type: inputType,
            placeholder
          }
        ],
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: confirmText,
            handler: (data) => resolve(data.input)
          }
        ]
      });
      await alert.present();
    });
  }

  // Show multiple choice dialog
  async showMultipleChoice(
    message: string,
    header: string,
    options: { value: any; label: string; checked?: boolean }[],
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<any[]> {
    return new Promise(async (resolve) => {
      const inputs = options.map(option => ({
        name: 'options',
        type: 'checkbox',
        label: option.label,
        value: option.value,
        checked: option.checked || false
      }));

      const alert = await this.alertController.create({
        header,
        message,
        inputs,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve([])
          },
          {
            text: confirmText,
            handler: (data) => resolve(data.options || [])
          }
        ]
      });
      await alert.present();
    });
  }

  // Show single choice dialog
  async showSingleChoice(
    message: string,
    header: string,
    options: { value: any; label: string; checked?: boolean }[],
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<any> {
    return new Promise(async (resolve) => {
      const inputs = options.map(option => ({
        name: 'option',
        type: 'radio',
        label: option.label,
        value: option.value,
        checked: option.checked || false
      }));

      const alert = await this.alertController.create({
        header,
        message,
        inputs,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: confirmText,
            handler: (data) => resolve(data.option)
          }
        ]
      });
      await alert.present();
    });
  }

  // Show action sheet
  async showActionSheet(options: ActionSheetOptions): Promise<HTMLIonActionSheetElement> {
    const actionSheet = await this.actionSheetController.create({
      header: options.header,
      subHeader: options.subHeader,
      cssClass: options.cssClass,
      buttons: options.buttons,
      backdropDismiss: options.backdropDismiss,
      translucent: options.translucent
    });
    await actionSheet.present();
    return actionSheet;
  }

  // Show card actions
  async showCardActions(cardId: string): Promise<string | null> {
    return new Promise(async (resolve) => {
      const actionSheet = await this.actionSheetController.create({
        header: 'Acciones de Tarjeta',
        buttons: [
          {
            text: 'Establecer como predeterminada',
            icon: 'star-outline',
            handler: () => resolve('set-default')
          },
          {
            text: 'Editar',
            icon: 'create-outline',
            handler: () => resolve('edit')
          },
          {
            text: 'Eliminar',
            icon: 'trash-outline',
            role: 'destructive',
            handler: () => resolve('delete')
          },
          {
            text: 'Cancelar',
            icon: 'close-outline',
            role: 'cancel',
            handler: () => resolve(null)
          }
        ]
      });
      await actionSheet.present();
    });
  }

  // Dismiss all dialogs
  async dismissAll(): Promise<void> {
    await this.alertController.dismiss();
    await this.actionSheetController.dismiss();
    await this.popoverController.dismiss();
  }
}