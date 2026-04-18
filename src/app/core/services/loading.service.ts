import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

export interface LoadingOptions {
  message?: string;
  duration?: number;
  spinner?: 'bubbles' | 'circles' | 'circular' | 'crescent' | 'dots' | 'lines' | 'lines-small' | null;
  cssClass?: string;
  showBackdrop?: boolean;
  backdropDismiss?: boolean;
  translucent?: boolean;
  animated?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeLoadings: HTMLIonLoadingElement[] = [];

  constructor(private loadingController: LoadingController) {}

  // Show loading indicator
  async show(message: string = 'Cargando...', options?: Partial<LoadingOptions>): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message,
      duration: options?.duration,
      spinner: options?.spinner || 'circles',
      cssClass: options?.cssClass,
      showBackdrop: options?.showBackdrop !== false,
      backdropDismiss: options?.backdropDismiss || false,
      translucent: options?.translucent || false,
      animated: options?.animated !== false
    });

    await loading.present();
    this.activeLoadings.push(loading);

    // Auto-remove when dismissed
    loading.onDidDismiss().then(() => {
      const index = this.activeLoadings.indexOf(loading);
      if (index > -1) {
        this.activeLoadings.splice(index, 1);
      }
    });

    return loading;
  }

  // Show loading for a specific duration
  async showForDuration(duration: number, message: string = 'Cargando...'): Promise<void> {
    const loading = await this.show(message, { duration });
    return new Promise(resolve => {
      setTimeout(() => {
        this.dismiss(loading);
        resolve();
      }, duration);
    });
  }

  // Show loading while executing a promise
  async showWhile<T>(
    promise: Promise<T>,
    message: string = 'Cargando...',
    options?: Partial<LoadingOptions>
  ): Promise<T> {
    const loading = await this.show(message, options);
    try {
      const result = await promise;
      await this.dismiss(loading);
      return result;
    } catch (error) {
      await this.dismiss(loading);
      throw error;
    }
  }

  // Show loading with progress
  async showProgress(
    message: string = 'Procesando...',
    progress: number = 0
  ): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: `${message} (${progress}%)`,
      spinner: 'circles',
      cssClass: 'progress-loading'
    });
    await loading.present();
    this.activeLoadings.push(loading);
    return loading;
  }

  // Update progress
  async updateProgress(loading: HTMLIonLoadingElement, progress: number, message?: string): Promise<void> {
    const percentage = Math.round(progress * 100);
    const displayMessage = message ? `${message} (${percentage}%)` : `Procesando... (${percentage}%)`;
    await loading.message = displayMessage;
  }

  // Dismiss specific loading
  async dismiss(loading: HTMLIonLoadingElement): Promise<void> {
    if (loading) {
      await loading.dismiss();
      const index = this.activeLoadings.indexOf(loading);
      if (index > -1) {
        this.activeLoadings.splice(index, 1);
      }
    }
  }

  // Dismiss all active loadings
  async dismissAll(): Promise<void> {
    for (const loading of this.activeLoadings) {
      await loading.dismiss();
    }
    this.activeLoadings = [];
  }

  // Get active loadings count
  getActiveCount(): number {
    return this.activeLoadings.length;
  }

  // Check if any loading is active
  isLoading(): boolean {
    return this.activeLoadings.length > 0;
  }

  // Show loading with custom spinner
  async showWithSpinner(
    spinner: LoadingOptions['spinner'],
    message: string = 'Cargando...'
  ): Promise<HTMLIonLoadingElement> {
    return this.show(message, { spinner });
  }

  // Show loading without backdrop
  async showWithoutBackdrop(message: string = 'Cargando...'): Promise<HTMLIonLoadingElement> {
    return this.show(message, { showBackdrop: false });
  }

  // Show loading with custom CSS
  async showWithCustomCSS(
    message: string,
    cssClass: string
  ): Promise<HTMLIonLoadingElement> {
    return this.show(message, { cssClass });
  }
}