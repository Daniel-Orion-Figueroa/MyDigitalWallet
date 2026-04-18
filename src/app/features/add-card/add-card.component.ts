import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

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
    private loadingController: LoadingController
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

  ngOnInit() {}

  get cardType() { return this.cardForm.get('cardType'); }
  get cardNumber() { return this.cardForm.get('cardNumber'); }
  get holderName() { return this.cardForm.get('holderName'); }
  get expiryMonth() { return this.cardForm.get('expiryMonth'); }
  get expiryYear() { return this.cardForm.get('expiryYear'); }
  get cvv() { return this.cardForm.get('cvv'); }

  async onSubmit() {
    this.isSubmitted = true;

    if (this.cardForm.valid) {
      this.isLoading = true;
      const loading = await this.loadingController.create({
        message: 'Agregando tarjeta...',
      });
      await loading.present();

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Tarjeta agregada correctamente',
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
          header: 'Error',
          message: 'No se pudo agregar la tarjeta. Inténtalo de nuevo.',
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