import { Component, Input } from '@angular/core';

interface Transaction {
  id: string;
  amount: number;
  date: Date;
  description: string;
  type: 'income' | 'expense';
  category: string;
}

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  standalone: false
})
export class TransactionListComponent {
  @Input() transactions: Transaction[] = [];

  getCategories(): string[] {
    const categories = this.transactions.map(t => t.category);
    return [...new Set(categories)];
  }

  getTransactionsByCategory(category: string): Transaction[] {
    return this.transactions.filter(t => t.category === category);
  }
}