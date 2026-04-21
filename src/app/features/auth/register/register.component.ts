import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem, IonLabel,
  IonSelect, IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonRow,
  IonCol
} from "@ionic/angular/standalone";
import { AuthResult, AuthService, RegisterData } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonImg, IonItem, IonLabel, 
    IonInput, IonIcon, IonText, IonButton, IonSelect, IonSelectOption, 
    IonButtons, IonBackButton, IonSpinner, IonCheckbox, IonRow, IonCol
  ]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitted = false;

  // Opciones para selects
  documentTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PASSPORT', label: 'Pasaporte' }
  ];

  countries = [
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Mexico', label: 'México' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Spain', label: 'España' },
    { value: 'United States', label: 'Estados Unidos' },
    { value: 'Other', label: 'Otro' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      documentType: ['CC', Validators.required],
      documentNumber: ['', [Validators.required, Validators.minLength(5)]],
      country: ['Colombia', Validators.required],
      phone: ['', Validators.pattern(/^[+]?[0-9\s-()]*$/)],
      termsAccepted: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Verificar si ya hay una sesión activa
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.emailVerified) {
        this.router.navigate(['/home']);
      }
    });
  }

  // Validador de contraseñas coincidentes
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  // Alternar visibilidad de contraseñas
  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  // Getters para validación
  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get documentType() {
    return this.registerForm.get('documentType');
  }

  get documentNumber() {
    return this.registerForm.get('documentNumber');
  }

  get country() {
    return this.registerForm.get('country');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  get termsAccepted() {
    return this.registerForm.get('termsAccepted');
  }

  // Enviar formulario
  async onSubmit() {
    this.isSubmitted = true;

    if (this.registerForm.invalid) {
      await this.showErrorToast('Por favor completa todos los campos correctamente');
      return;
    }

    const registerData: RegisterData = {
      firstName: this.registerForm.value.firstName.trim(),
      lastName: this.registerForm.value.lastName.trim(),
      email: this.registerForm.value.email.trim().toLowerCase(),
      password: this.registerForm.value.password,
      documentType: this.registerForm.value.documentType,
      documentNumber: this.registerForm.value.documentNumber.trim(),
      country: this.registerForm.value.country,
      phone: this.registerForm.value.phone?.trim() || undefined
    };

    await this.performRegistration(registerData);
  }

  // Realizar registro
  async performRegistration(data: RegisterData) {
    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: 'Creando tu cuenta...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      const result: AuthResult = await this.authService.register(data);

      if (result.success) {
        await loading.dismiss();
        
        if (result.requiresVerification) {
          // Mostrar alerta de verificación requerida
          await this.showVerificationAlert(result.user?.email || '');
        } else {
          // Registro exitoso
          await this.showSuccessToast('¡Cuenta creada exitosamente!');
          this.router.navigate(['/login']);
        }
      } else {
        await loading.dismiss();
        await this.showErrorToast(result.error || 'Error al registrar usuario');
      }
    } catch (error: any) {
      await loading.dismiss();
      await this.showErrorToast(error.message || 'Error inesperado');
    } finally {
      this.isLoading = false;
    }
  }

  // Alerta de verificación requerida
  async showVerificationAlert(email: string) {
    const alert = await this.alertController.create({
      header: 'Cuenta Creada',
      message: `
        <div style="text-align: center;">
          <p>¡Tu cuenta ha sido creada exitosamente!</p>
          <p>Hemos enviado un email de verificación a:</p>
          <p><strong>${email}</strong></p>
          <p>Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.</p>
        </div>
      `,
      buttons: [
        {
          text: 'Entendido',
          handler: () => {
            this.router.navigate(['/login']);
          }
        },
        {
          text: 'Reenviar Email',
          handler: () => {
            this.resendVerificationEmail(email);
          }
        }
      ]
    });

    await alert.present();
  }

  // Reenviar email de verificación
  async resendVerificationEmail(email: string) {
    const loading = await this.loadingController.create({
      message: 'Reenviando email...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      // Aquí necesitarías un método para reenviar email sin estar autenticado
      // Por ahora mostramos un mensaje
      await loading.dismiss();
      await this.showSuccessToast('Si no recibes el email, revisa tu carpeta de spam');
    } catch (error: any) {
      await loading.dismiss();
      await this.showErrorToast(error.message || 'Error al reenviar email');
    }
  }

  // Mostrar términos y condiciones
  async showTermsAndConditions() {
    const alert = await this.alertController.create({
      header: 'Términos y Condiciones',
      message: `
        <div style="max-height: 300px; overflow-y: auto;">
          <h4>1. Aceptación de Términos</h4>
          <p>Al registrarte en MyDigitalWallet, aceptas estos términos y condiciones.</p>
          
          <h4>2. Uso del Servicio</h4>
          <p>Te comprometes a usar el servicio de manera responsable y legal.</p>
          
          <h4>3. Protección de Datos</h4>
          <p>Protegemos tu información según nuestra política de privacidad.</p>
          
          <h4>4. Seguridad</h4>
          <p>Eres responsable de mantener segura tu contraseña y credenciales.</p>
          
          <h4>5. Limitaciones de Responsabilidad</h4>
          <p>MyDigitalWallet no se hace responsable de pérdidas por uso indebido.</p>
        </div>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  // Mostrar política de privacidad
  async showPrivacyPolicy() {
    const alert = await this.alertController.create({
      header: 'Política de Privacidad',
      message: `
        <div style="max-height: 300px; overflow-y: auto;">
          <h4>1. Información Recopilada</h4>
          <p>Recopilamos información personal necesaria para proporcionar nuestros servicios.</p>
          
          <h4>2. Uso de la Información</h4>
          <p>Usamos tu información para operar, mantener y mejorar nuestros servicios.</p>
          
          <h4>3. Compartir Información</h4>
          <p>No vendemos ni compartimos tu información personal con terceros.</p>
          
          <h4>4. Seguridad</h4>
          <p>Implementamos medidas de seguridad para proteger tu información.</p>
          
          <h4>5. Derechos del Usuario</h4>
          <p>Tienes derecho a acceder, corregir o eliminar tu información.</p>
        </div>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  // Métodos de utilidad
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }

  // Navegación
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
