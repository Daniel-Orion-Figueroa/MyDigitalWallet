import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

export interface NotificationOptions {
  header?: string;
  message: string;
  buttons?: any[];
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  // Show success alert
  async showSuccess(message: string, header: string = 'Éxito'): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'success-alert'
    });
    await alert.present();
  }

  // Show error alert
  async showError(message: string, header: string = 'Error'): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });
    await alert.present();
  }

  // Show warning alert
  async showWarning(message: string, header: string = 'Advertencia'): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'warning-alert'
    });
    await alert.present();
  }

  // Show info alert
  async showInfo(message: string, header: string = 'Información'): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'info-alert'
    });
    await alert.present();
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

  // Show custom alert
  async showAlert(options: NotificationOptions): Promise<void> {
    const alert = await this.alertController.create({
      header: options.header,
      message: options.message,
      buttons: options.buttons || ['OK']
    });
    await alert.present();
  }

  // Show success toast
  async showSuccessToast(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'success',
      position: 'top',
      cssClass: 'success-toast'
    });
    await toast.present();
  }

  // Show error toast
  async showErrorToast(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'danger',
      position: 'top',
      cssClass: 'error-toast'
    });
    await toast.present();
  }

  // Show warning toast
  async showWarningToast(message: string, duration: number = 2500): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'warning',
      position: 'top',
      cssClass: 'warning-toast'
    });
    await toast.present();
  }

  // Show info toast
  async showInfoToast(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'primary',
      position: 'top',
      cssClass: 'info-toast'
    });
    await toast.present();
  }

  // Show loading notification
  async showLoading(message: string = 'Cargando...'): Promise<HTMLIonLoadingElement> {
    const loading = await this.alertController.create({
      message,
      spinner: 'circles',
      cssClass: 'custom-loading'
    });
    await loading.present();
    return loading;
  }

  // Dismiss loading
  async dismissLoading(loading: HTMLIonLoadingElement): Promise<void> {
    await loading.dismiss();
  }

  // Show progress notification (for long operations)
  async showProgress(
    message: string,
    progress: number,
    total: number
  ): Promise<void> {
    const percentage = Math.round((progress / total) * 100);
    const toast = await this.toastController.create({
      message: `${message} (${percentage}%)`,
      duration: 1500,
      position: 'bottom',
      cssClass: 'progress-toast'
    });
    await toast.present();
  }
}