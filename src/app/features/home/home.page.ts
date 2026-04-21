import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Card, CardService } from '../../core/services/card.service';
import { UserService } from '../../core/services/user.service';
import { Observable } from 'rxjs';

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
  balance: number = 0;
  showBalance: boolean = true;
  cards: Card[] = [];
  currentUser$: Observable<any>;
  transactions: Transaction[] = [
    {
      id: '1',
      description: 'Supermarket',
      amount: 150000,
      type: 'expense',
      date: new Date()
    },
    {
      id: '2',
      description: 'Salary Deposit',
      amount: 2000000,
      type: 'income',
      date: new Date(Date.now() - 86400000)
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cardService: CardService,
    private userService: UserService
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadUserData();
    this.loadCards();
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

  openProfile() {
    // Aquí abriremos el Modal del Profile más adelante
    console.log("Abrir perfil");
  }

  async loadUserData() {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.balance = user.balance;
    }
  }

  async loadCards() {
    try {
      this.cards = await this.cardService.getUserCards();
    } catch (error) {
      console.error('Error cargando tarjetas:', error);
    }
  }

  selectCard(card: Card) {
    console.log('Selected card:', card);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
