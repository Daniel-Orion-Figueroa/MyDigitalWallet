import { Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';

export interface BiometricResult {
  success: boolean;
  available: boolean;
  enrolled?: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  constructor() {}

  async checkBiometricAvailability(): Promise<BiometricResult> {
    try {
      const result = await NativeBiometric.isAvailable();
      return {
        success: true,
        available: result.isAvailable,
        enrolled: result.hasCredentials
      };
    } catch (error: any) {
      return {
        success: false,
        available: false,
        error: error.message
      };
    }
  }

  async verifyBiometricIdentity(reason?: string): Promise<BiometricResult> {
    try {
      await NativeBiometric.verifyIdentity({
        reason: reason || 'Verifica tu identidad para continuar',
        title: 'Autenticación Biométrica',
        subtitle: 'Usa tu huella o rostro',
        description: 'Esto asegura que solo tú puedas acceder'
      });
      return {
        success: true,
        available: true
      };
    } catch (error: any) {
      return {
        success: false,
        available: true,
        error: error.message
      };
    }
  }

  async setBiometricCredentials(username: string, password: string): Promise<BiometricResult> {
    try {
      await NativeBiometric.setCredentials({
        username,
        password,
        server: 'mydigitalwallet'
      });
      return {
        success: true,
        available: true
      };
    } catch (error: any) {
      return {
        success: false,
        available: true,
        error: error.message
      };
    }
  }

  async getBiometricCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await NativeBiometric.getCredentials({
        server: 'mydigitalwallet'
      });
      return credentials;
    } catch (error) {
      return null;
    }
  }

  async deleteBiometricCredentials(): Promise<BiometricResult> {
    try {
      await NativeBiometric.deleteCredentials({
        server: 'mydigitalwallet'
      });
      return {
        success: true,
        available: true
      };
    } catch (error: any) {
      return {
        success: false,
        available: true,
        error: error.message
      };
    }
  }
}