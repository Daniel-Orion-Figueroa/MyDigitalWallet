import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  standalone: false
})
export class CalendarComponent {
  @Output() dateSelected = new EventEmitter<Date>();

  selectedDate: string = '';

  onDateChange() {
    if (this.selectedDate) {
      this.dateSelected.emit(new Date(this.selectedDate));
    }
  }
}