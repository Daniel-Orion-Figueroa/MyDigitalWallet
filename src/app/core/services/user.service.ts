import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  documentType: 'CC' | 'CE' | 'TI' | 'PASSPORT';
  documentNumber: string;
  country: string;
  phone?: string;
  balance: number;
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
    biometricEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isInitialized = false;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {
    // Initialize auth subscription lazily on first access
    this.initializeAuthSubscription();
  }

  private initializeAuthSubscription(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.loadUserProfile(user.uid);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  async loadUserProfile(uid: string): Promise<void> {
    try {
      const userData = await this.firestoreService.getDocument('users', uid);
      if (userData) {
        this.currentUserSubject.next(userData as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async createUserProfile(userData: Partial<UserProfile>): Promise<string> {
    try {
      const defaultProfile: UserProfile = {
        uid: userData.uid!,
        email: userData.email!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        documentType: userData.documentType!,
        documentNumber: userData.documentNumber!,
        country: userData.country!,
        phone: userData.phone,
        balance: 0,
        preferences: {
          currency: 'COP',
          language: 'es',
          notifications: true,
          biometricEnabled: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userId = await this.firestoreService.createDocument('users', defaultProfile, userData.uid);
      this.currentUserSubject.next(defaultProfile);
      return userId;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error('No user logged in');

      await this.firestoreService.updateDocument('users', currentUser.uid, updates);

      const updatedProfile = { ...currentUser, ...updates, updatedAt: new Date() };
      this.currentUserSubject.next(updatedProfile);
    } catch (error) {
      throw error;
    }
  }

  async updateBalance(amount: number): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error('No user logged in');

      const newBalance = currentUser.balance + amount;
      await this.updateUserProfile({ balance: newBalance });
    } catch (error) {
      throw error;
    }
  }

  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error('No user logged in');

      const updatedPreferences = { ...currentUser.preferences, ...preferences };
      await this.updateUserProfile({ preferences: updatedPreferences });
    } catch (error) {
      throw error;
    }
  }

  async deleteUserProfile(): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error('No user logged in');

      await this.firestoreService.deleteDocument('users', currentUser.uid);
      this.currentUserSubject.next(null);
    } catch (error) {
      throw error;
    }
  }
}