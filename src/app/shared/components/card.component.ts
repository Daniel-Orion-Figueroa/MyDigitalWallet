import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  standalone: false
})
export class CardComponent {
  @Input() type: 'visa' | 'mastercard' = 'visa';
  @Input() number: string = '';
  @Input() holderName: string = '';
  @Input() expiryDate: string = '';
}