import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { UserService } from './user.service';
import { CardService } from './card.service';

export interface Transaction {
  id?: string;
  userId: string;
  cardId: string;
  type: 'payment' | 'transfer' | 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  merchant?: string;
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  cardId: string;
  amount: number;
  description: string;
  merchant?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(
    private firestoreService: FirestoreService,
    private userService: UserService,
    private cardService: CardService
  ) {}

  // Process payment
  async processPayment(paymentRequest: PaymentRequest): Promise<Transaction> {
    try {
      const currentUser = this.userService.getCurrentUser();
      if (!currentUser) throw new Error('Usuario no autenticado');

      // Validate card exists and belongs to user
      const card = await this.cardService.getCard(paymentRequest.cardId);
      if (!card || card.userId !== currentUser.uid) {
        throw new Error('Tarjeta no encontrada o no autorizada');
      }

      // Check sufficient balance
      if (currentUser.balance < paymentRequest.amount) {
        throw new Error('Saldo insuficiente');
      }

      // Simulate payment processing delay
      await this.simulatePaymentProcessing();

      // Create transaction record
      const transaction: Transaction = {
        userId: currentUser.uid,
        cardId: paymentRequest.cardId,
        type: 'payment',
        amount: paymentRequest.amount,
        description: paymentRequest.description,
        status: 'completed',
        merchant: paymentRequest.merchant,
        category: paymentRequest.category,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save transaction
      const transactionId = await this.firestoreService.createDocument('transactions', transaction);

      // Update user balance
      await this.userService.updateBalance(-paymentRequest.amount);

      return { ...transaction, id: transactionId };
    } catch (error) {
      throw error;
    }
  }

  // Simulate payment processing (for demo purposes)
  private async simulatePaymentProcessing(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 95% success rate for simulation
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('Error en el procesamiento del pago'));
        }
      }, 2000 + Math.random() * 3000); // 2-5 seconds
    });
  }

  // Get user transactions
  async getUserTransactions(
    limitCount?: number,
    status?: Transaction['status']
  ): Promise<Transaction[]> {
    try {
      const currentUser = this.userService.getCurrentUser();
      if (!currentUser) throw new Error('Usuario no autenticado');

      const conditions = [{ field: 'userId', operator: '==', value: currentUser.uid }];
      if (status) {
        conditions.push({ field: 'status', operator: '==', value: status });
      }

      const transactions = await this.firestoreService.getCollection(
        'transactions',
        conditions,
        'createdAt',
        'desc',
        limitCount
      );

      return transactions as Transaction[];
    } catch (error) {
      throw error;
    }
  }

  // Get transaction by ID
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const transaction = await this.firestoreService.getDocument('transactions', transactionId);
      return transaction as Transaction;
    } catch (error) {
      throw error;
    }
  }

  // Cancel transaction (if pending)
  async cancelTransaction(transactionId: string): Promise<void> {
    try {
      const transaction = await this.getTransaction(transactionId);
      if (!transaction) throw new Error('Transacción no encontrada');

      if (transaction.status !== 'pending') {
        throw new Error('Solo se pueden cancelar transacciones pendientes');
      }

      await this.firestoreService.updateDocument('transactions', transactionId, {
        status: 'cancelled',
        updatedAt: new Date()
      });

      // Refund amount if it was a payment
      if (transaction.type === 'payment') {
        await this.userService.updateBalance(transaction.amount);
      }
    } catch (error) {
      throw error;
    }
  }

  // Get transaction statistics
  async getTransactionStats(): Promise<{
    totalTransactions: number;
    totalSpent: number;
    totalReceived: number;
    averageTransaction: number;
  }> {
    try {
      const transactions = await this.getUserTransactions();

      const payments = transactions.filter(t => t.type === 'payment' && t.status === 'completed');
      const deposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed');

      const totalSpent = payments.reduce((sum, t) => sum + t.amount, 0);
      const totalReceived = deposits.reduce((sum, t) => sum + t.amount, 0);
      const totalTransactions = payments.length + deposits.length;
      const averageTransaction = totalTransactions > 0 ? (totalSpent + totalReceived) / totalTransactions : 0;

      return {
        totalTransactions,
        totalSpent,
        totalReceived,
        averageTransaction
      };
    } catch (error) {
      throw error;
    }
  }

  // Generate receipt for transaction
  generateReceipt(transaction: Transaction): string {
    const receipt = `
      RECIBO DE TRANSACCIÓN
      =====================

      ID de Transacción: ${transaction.id}
      Fecha: ${transaction.createdAt.toLocaleString('es-CO')}
      Tipo: ${transaction.type.toUpperCase()}
      Monto: $${transaction.amount.toLocaleString('es-CO')}
      Descripción: ${transaction.description}
      Estado: ${transaction.status.toUpperCase()}

      ${transaction.merchant ? `Comercio: ${transaction.merchant}` : ''}
      ${transaction.category ? `Categoría: ${transaction.category}` : ''}

      Gracias por usar MyDigitalWallet
    `;

    return receipt.trim();
  }
}