import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-balance-display',
  templateUrl: './balance-display.component.html',
  standalone: false
})
export class BalanceDisplayComponent {
  @Input() balance: number = 0;
  isVisible: boolean = true;

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }
}