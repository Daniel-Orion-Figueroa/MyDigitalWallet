import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { CardService, Card } from '../../core/services/card.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  standalone: false,
})
export class AddCardComponent implements OnInit {
  cardForm: FormGroup;
  isSubmitted = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private cardService: CardService,
    private toastService: ToastService
  ) {
    this.cardForm = this.formBuilder.group({
      cardType: ['visa', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      holderName: ['', [Validators.required, Validators.minLength(2)]],
      expiryMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      expiryYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });
  }

  ngOnInit() {
    // Detectar automáticamente el tipo de tarjeta basándose en los primeros dígitos
    this.cardForm.get('cardNumber')?.valueChanges.subscribe(value => {
      if (value) {
        if (/^4/.test(value)) {
          this.cardForm.get('cardType')?.setValue('visa');
        } else if (/^5[1-5]/.test(value) || /^2[2-7]/.test(value)) {
          this.cardForm.get('cardType')?.setValue('mastercard');
        } else if (/^3[47]/.test(value)) {
          this.cardForm.get('cardType')?.setValue('amex');
        }
      }
    });
  }

  get cardType() { return this.cardForm.get('cardType'); }
  get cardNumber() { return this.cardForm.get('cardNumber'); }
  get holderName() { return this.cardForm.get('holderName'); }
  get expiryMonth() { return this.cardForm.get('expiryMonth'); }
  get expiryYear() { return this.cardForm.get('expiryYear'); }
  get cvv() { return this.cardForm.get('cvv'); }

  getPreviewCard(): Card {
    const vals = this.cardForm.value;
    return {
      userId: 'preview',
      type: vals.cardType || 'visa',
      number: vals.cardNumber || '0000000000000000',
      holderName: vals.holderName || 'JOHN DOE',
      expiryMonth: vals.expiryMonth || '00',
      expiryYear: vals.expiryYear || '00',
      cvv: vals.cvv || '000',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async onSubmit() {
    this.isSubmitted = true;

    if (this.cardForm.valid) {
      this.isLoading = true;
      const loading = await this.loadingController.create({
        message: 'Agregando tarjeta...',
      });
      await loading.present();

      try {
        const cardData = {
          type: this.cardForm.value.cardType as 'visa' | 'mastercard' | 'amex',
          number: this.cardForm.value.cardNumber,
          holderName: this.cardForm.value.holderName,
          expiryMonth: this.cardForm.value.expiryMonth,
          expiryYear: this.cardForm.value.expiryYear,
          cvv: this.cardForm.value.cvv,
          isDefault: false
        };

        await this.cardService.addCard(cardData);

        await this.toastService.showSuccess('Tarjeta agregada correctamente');
        this.router.navigate(['/home']);
      } catch (error: any) {
        await this.toastService.showError(error.message || 'Error al agregar la tarjeta');
      } finally {
        this.isLoading = false;
        await loading.dismiss();
      }
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}