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
  selector: 'app-transaction-item',
  templateUrl: './transaction-item.component.html',
  standalone: false
})
export class TransactionItemComponent {
  @Input() transaction!: Transaction;
}