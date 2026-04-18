import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';

// Interfaces temporales hasta que tengamos los servicios
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresVerification?: boolean;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [IonicModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  isSubmitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService, // Temporalmente comentado
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Verificar si ya hay una sesión activa
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.emailVerified) {
        this.router.navigate(['/home']);
      }
    });
  }

  // Alternar visibilidad de contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Validar formulario
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // Enviar formulario
  async onSubmit() {
    this.isSubmitted = true;

    if (this.loginForm.invalid) {
      await this.showErrorToast('Por favor completa todos los campos correctamente');
      return;
    }

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    await this.performLogin(credentials);
  }

  // Realizar login
  async performLogin(credentials: LoginCredentials) {
    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      const result: AuthResult = await this.authService.login(credentials);

      if (result.success) {
        await loading.dismiss();
        
        if (result.user && !result.user.emailVerified) {
          // Email no verificado
          await this.showEmailVerificationAlert();
        } else {
          // Login exitoso
          await this.showSuccessToast('¡Bienvenido! Sesión iniciada correctamente');
          this.router.navigate(['/home']);
        }
      } else {
        await loading.dismiss();
        await this.showErrorToast(result.error || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      await loading.dismiss();
      await this.showErrorToast(error.message || 'Error inesperado');
    } finally {
      this.isLoading = false;
    }
  }

  // Login con Google
  async loginWithGoogle() {
    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: 'Conectando con Google...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      const result: AuthResult = await this.authService.loginWithGoogle();

      if (result.success) {
        await loading.dismiss();
        await this.showSuccessToast('¡Bienvenido! Sesión iniciada con Google');
        this.router.navigate(['/home']);
      } else {
        await loading.dismiss();
        await this.showErrorToast(result.error || 'Error al iniciar sesión con Google');
      }
    } catch (error: any) {
      await loading.dismiss();
      await this.showErrorToast(error.message || 'Error inesperado');
    } finally {
      this.isLoading = false;
    }
  }

  // Alerta de email no verificado
  async showEmailVerificationAlert() {
    const alert = await this.alertController.create({
      header: 'Email No Verificado',
      message: 'Tu cuenta no ha sido verificada. Por favor revisa tu correo y haz clic en el enlace de verificación.',
      buttons: [

        {
          text: 'OK',
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Navegación
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
