import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardNumber',
  standalone: false
})
export class CardNumberPipe implements PipeTransform {

  transform(value: string): string {
    if (!value || value.length < 4) return value;
    const lastFour = value.slice(-4);
    const masked = '**** **** **** ' + lastFour;
    return masked;
  }

}