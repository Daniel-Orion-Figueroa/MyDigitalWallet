import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

interface Card {
  id: string;
  type: 'visa' | 'mastercard';
  number: string;
  holderName: string;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: false,
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  isSubmitted = false;
  isLoading = false;
  selectedCard: Card | null = null;

  cards: Card[] = [
    {
      id: '1',
      type: 'visa',
      number: '4111111111111111',
      holderName: 'Juan Pérez'
    },
    {
      id: '2',
      type: 'mastercard',
      number: '5555555555554444',
      holderName: 'Juan Pérez'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.paymentForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(1000)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      selectedCardId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    if (this.cards.length > 0) {
      this.selectedCard = this.cards[0];
      this.paymentForm.patchValue({ selectedCardId: this.cards[0].id });
    }
  }

  get amount() { return this.paymentForm.get('amount'); }
  get description() { return this.paymentForm.get('description'); }
  get selectedCardId() { return this.paymentForm.get('selectedCardId'); }

  onCardChange(event: any) {
    const cardId = event.detail.value;
    this.selectedCard = this.cards.find(card => card.id === cardId) || null;
  }

  async onSubmit() {
    this.isSubmitted = true;

    if (this.paymentForm.valid && this.selectedCard) {
      this.isLoading = true;
      const loading = await this.loadingController.create({
        message: 'Procesando pago...',
      });
      await loading.present();

      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        const alert = await this.alertController.create({
          header: 'Pago Exitoso',
          message: `Se ha realizado el pago de $${this.amount?.value?.toLocaleString('es-CO')} con la tarjeta ${this.selectedCard.type.toUpperCase()} ****${this.selectedCard.number.slice(-4)}`,
          buttons: [{
            text: 'OK',
            handler: () => {
              this.router.navigate(['/home']);
            }
          }]
        });
        await alert.present();
      } catch (error) {
        const alert = await this.alertController.create({
          header: 'Error en el Pago',
          message: 'No se pudo procesar el pago. Verifica tus datos e intenta nuevamente.',
          buttons: ['OK']
        });
        await alert.present();
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