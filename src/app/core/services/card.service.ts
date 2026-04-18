import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

export interface Card {
  id?: string;
  userId: string;
  type: 'visa' | 'mastercard' | 'amex';
  number: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {}

  // Luhn Algorithm for card number validation
  private validateCardNumber(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\s/g, '').split('').reverse().map(Number);
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
      let digit = digits[i];
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
    }

    return sum % 10 === 0;
  }

  // Detect card type based on number
  private detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | null {
    const number = cardNumber.replace(/\s/g, '');

    if (/^4/.test(number)) {
      return 'visa';
    } else if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
      return 'mastercard';
    } else if (/^3[47]/.test(number)) {
      return 'amex';
    }

    return null;
  }

  // Validate card data
  validateCard(cardData: Partial<Card>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!cardData.number || !this.validateCardNumber(cardData.number)) {
      errors.push('Número de tarjeta inválido');
    }

    if (!cardData.holderName || cardData.holderName.trim().length < 2) {
      errors.push('Nombre del titular requerido');
    }

    if (!cardData.expiryMonth || !/^(0[1-9]|1[0-2])$/.test(cardData.expiryMonth)) {
      errors.push('Mes de expiración inválido');
    }

    if (!cardData.expiryYear || !/^\d{2}$/.test(cardData.expiryYear)) {
      errors.push('Año de expiración inválido');
    }

    // Check if card is expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    const expiryYear = parseInt(cardData.expiryYear!);
    const expiryMonth = parseInt(cardData.expiryMonth!);

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      errors.push('La tarjeta ha expirado');
    }

    if (!cardData.cvv || !/^\d{3,4}$/.test(cardData.cvv)) {
      errors.push('CVV inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Add new card
  async addCard(cardData: Omit<Card, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const currentUser = await this.authService.getCurrentUser().toPromise();
      if (!currentUser) throw new Error('Usuario no autenticado');

      const validation = this.validateCard(cardData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const detectedType = this.detectCardType(cardData.number);
      if (!detectedType) {
        throw new Error('Tipo de tarjeta no reconocido');
      }

      const card: Card = {
        ...cardData,
        userId: currentUser.uid,
        type: detectedType,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // If this is the first card, make it default
      const userCards = await this.getUserCards();
      if (userCards.length === 0) {
        card.isDefault = true;
      }

      const cardId = await this.firestoreService.createDocument('cards', card);
      return cardId;
    } catch (error) {
      throw error;
    }
  }

  // Get user's cards
  async getUserCards(): Promise<Card[]> {
    try {
      const currentUser = await this.authService.getCurrentUser().toPromise();
      if (!currentUser) throw new Error('Usuario no autenticado');

      const cards = await this.firestoreService.getCollection(
        'cards',
        [{ field: 'userId', operator: '==', value: currentUser.uid }],
        'createdAt',
        'desc'
      );

      return cards as Card[];
    } catch (error) {
      throw error;
    }
  }

  // Get specific card
  async getCard(cardId: string): Promise<Card | null> {
    try {
      const card = await this.firestoreService.getDocument('cards', cardId);
      return card as Card;
    } catch (error) {
      throw error;
    }
  }

  // Update card
  async updateCard(cardId: string, updates: Partial<Card>): Promise<void> {
    try {
      await this.firestoreService.updateDocument('cards', cardId, updates);
    } catch (error) {
      throw error;
    }
  }

  // Delete card
  async deleteCard(cardId: string): Promise<void> {
    try {
      await this.firestoreService.deleteDocument('cards', cardId);
    } catch (error) {
      throw error;
    }
  }

  // Set default card
  async setDefaultCard(cardId: string): Promise<void> {
    try {
      const currentUser = await this.authService.getCurrentUser().toPromise();
      if (!currentUser) throw new Error('Usuario no autenticado');

      // Remove default from all user cards
      const userCards = await this.getUserCards();
      for (const card of userCards) {
        if (card.isDefault) {
          await this.updateCard(card.id!, { isDefault: false });
        }
      }

      // Set new default
      await this.updateCard(cardId, { isDefault: true });
    } catch (error) {
      throw error;
    }
  }

  // Get default card
  async getDefaultCard(): Promise<Card | null> {
    try {
      const cards = await this.getUserCards();
      return cards.find(card => card.isDefault) || null;
    } catch (error) {
      throw error;
    }
  }

  // Mask card number for display
  maskCardNumber(cardNumber: string): string {
    const lastFour = cardNumber.slice(-4);
    const masked = '**** **** **** ' + lastFour;
    return masked;
  }
}