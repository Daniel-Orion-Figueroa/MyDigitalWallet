import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

export interface ToastOptions {
  message: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'middle';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  buttons?: any[];
  cssClass?: string;
  translucent?: boolean;
  animated?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  // Show basic toast
  async show(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    await toast.present();
  }

  // Show success toast
  async showSuccess(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'success',
      position: 'bottom',
      icon: 'checkmark-circle-outline',
      cssClass: 'success-toast'
    });
    await toast.present();
  }

  // Show error toast
  async showError(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'danger',
      position: 'bottom',
      icon: 'close-circle-outline',
      cssClass: 'error-toast'
    });
    await toast.present();
  }

  // Show warning toast
  async showWarning(message: string, duration: number = 2500): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'warning',
      position: 'bottom',
      icon: 'warning-outline',
      cssClass: 'warning-toast'
    });
    await toast.present();
  }

  // Show info toast
  async showInfo(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'primary',
      position: 'bottom',
      icon: 'information-circle-outline',
      cssClass: 'info-toast'
    });
    await toast.present();
  }

  // Show loading toast
  async showLoading(message: string = 'Cargando...', duration: number = 0): Promise<HTMLIonToastElement> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      spinner: 'circles',
      cssClass: 'loading-toast'
    });
    await toast.present();
    return toast;
  }

  // Show toast with action button
  async showWithAction(
    message: string,
    actionText: string,
    actionHandler: () => void,
    duration: number = 4000
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      buttons: [
        {
          text: actionText,
          handler: actionHandler
        }
      ]
    });
    await toast.present();
  }

  // Show undo toast
  async showUndo(
    message: string,
    undoHandler: () => void,
    duration: number = 4000
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      buttons: [
        {
          text: 'Deshacer',
          handler: undoHandler
        }
      ],
      cssClass: 'undo-toast'
    });
    await toast.present();
  }

  // Show custom toast
  async showCustom(options: ToastOptions): Promise<HTMLIonToastElement> {
    const toast = await this.toastController.create({
      message: options.message,
      duration: options.duration || 2000,
      position: options.position || 'bottom',
      color: options.color,
      buttons: options.buttons,
      cssClass: options.cssClass,
      translucent: options.translucent,
      animated: options.animated
    });
    await toast.present();
    return toast;
  }

  // Dismiss all toasts
  async dismissAll(): Promise<void> {
    await this.toastController.dismiss();
  }

  // Get active toast
  async getTop(): Promise<HTMLIonToastElement | null> {
    return await this.toastController.getTop();
  }
}