import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Card {
  id: string;
  type: 'visa' | 'mastercard';
  number: string;
  holderName: string;
  expiryDate: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  balance: number = 1500000; // Example balance in COP
  showBalance: boolean = true;
  cards: Card[] = [
    {
      id: '1',
      type: 'visa',
      number: '4111111111111111',
      holderName: 'Juan Pérez',
      expiryDate: '12/25'
    },
    {
      id: '2',
      type: 'mastercard',
      number: '5555555555554444',
      holderName: 'Juan Pérez',
      expiryDate: '08/26'
    }
  ];
  transactions: Transaction[] = [
    {
      id: '1',
      description: 'Compra en Supermercado',
      amount: 150000,
      type: 'expense',
      date: new Date()
    },
    {
      id: '2',
      description: 'Depósito Salarial',
      amount: 2000000,
      type: 'income',
      date: new Date(Date.now() - 86400000)
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Load user data, cards, transactions from service
  }

  toggleBalanceVisibility() {
    this.showBalance = !this.showBalance;
  }

  goToAddCard() {
    this.router.navigate(['/add-card']);
  }

  goToPayment() {
    this.router.navigate(['/payment']);
  }

  selectCard(card: Card) {
    // Handle card selection, maybe navigate to card details
    console.log('Selected card:', card);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
