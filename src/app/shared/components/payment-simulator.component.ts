import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment-simulator',
  templateUrl: './payment-simulator.component.html',
  standalone: false
})
export class PaymentSimulatorComponent {
  @Output() paymentProcessed = new EventEmitter<any>();

  paymentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });
  }

  get amountControl(): FormControl {
    return this.paymentForm.get('amount') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.paymentForm.get('description') as FormControl;
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      this.paymentProcessed.emit(this.paymentForm.value);
    }
  }
}