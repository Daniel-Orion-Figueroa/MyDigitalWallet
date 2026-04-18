import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  standalone: false
})
export class QuickActionsComponent {
  @Output() actionSelected = new EventEmitter<string>();

  onAction(action: string) {
    this.actionSelected.emit(action);
  }
}