import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Card, CardService } from '../../core/services/card.service';
import { PaymentService } from '../../core/services/payment.service';

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

  cards: Card[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private cardService: CardService,
    private paymentService: PaymentService
  ) {
    this.paymentForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(1000)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      selectedCardId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadCards();
  }

  async loadCards() {
    try {
      this.cards = await this.cardService.getUserCards();
      if (this.cards.length > 0) {
        this.selectedCard = this.cards[0];
        this.paymentForm.patchValue({ selectedCardId: this.cards[0].id });
      }
    } catch (error) {
      console.error('Error cargando tarjetas:', error);
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
        const paymentRequest = {
          cardId: this.selectedCard.id!,
          amount: Number(this.amount?.value),
          description: this.description?.value,
          merchant: 'Comercio simulado'
        };

        await this.paymentService.processPayment(paymentRequest);

        const alert = await this.alertController.create({
          header: 'Pago Exitoso',
          message: `Se ha realizado el pago de $${paymentRequest.amount.toLocaleString('es-CO')} con la tarjeta ${this.selectedCard.type.toUpperCase()} ****${this.selectedCard.number.slice(-4)}`,
          buttons: [{
            text: 'OK',
            handler: () => {
              this.router.navigate(['/home']);
            }
          }]
        });
        await alert.present();
      } catch (error: any) {
        const alert = await this.alertController.create({
          header: 'Error en el Pago',
          message: error?.message || 'No se pudo procesar el pago. Verifica tus datos e intenta nuevamente.',
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