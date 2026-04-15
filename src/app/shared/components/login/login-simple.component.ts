import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full space-y-8">
        <!-- Logo y Título -->
        <div class="text-center">
          <div class="mx-auto h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
            <span class="text-white text-3xl">💳</span>
          </div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">MyDigitalWallet</h2>
          <p class="mt-2 text-sm text-gray-600">Tu billetera digital segura</p>
        </div>

        <!-- Formulario de Login -->
        <div class="bg-white shadow-xl rounded-lg p-8">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <div class="mt-1 relative">
                <input 
                  formControlName="email"
                  type="email" 
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="tu@email.com"
                />
                <span class="absolute right-3 top-3 text-gray-400">📧</span>
              </div>
              <div *ngIf="isSubmitted && email?.invalid" class="text-red-500 text-xs mt-1">
                <span *ngIf="email?.errors?.['required']">El email es requerido</span>
                <span *ngIf="email?.errors?.['email']">El email no es válido</span>
              </div>
            </div>

            <!-- Contraseña -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Contraseña</label>
              <div class="mt-1 relative">
                <input 
                  formControlName="password"
                  [type]="showPassword ? 'text' : 'password'"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Tu contraseña"
                />
                <button 
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <span>{{ showPassword ? '👁' : '👁' }}</span>
                </button>
              </div>
              <div *ngIf="isSubmitted && password?.invalid" class="text-red-500 text-xs mt-1">
                <span *ngIf="password?.errors?.['required']">La contraseña es requerida</span>
                <span *ngIf="password?.errors?.['minlength']">Mínimo 6 caracteres</span>
              </div>
            </div>

            <!-- Botón de Login -->
            <div>
              <button 
                type="submit"
                [disabled]="isLoading || loginForm.invalid"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span *ngIf="!isLoading">Iniciar Sesión</span>
                <div *ngIf="isLoading" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-gray-900 border-t-transparent"></div>
                  <span class="ml-2">Iniciando sesión...</span>
                </div>
              </button>
            </div>
          </form>

          <!-- Olvidé mi contraseña -->
          <div class="mt-6 text-center">
            <button 
              type="button"
              (click)="forgotPassword()"
              class="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <!-- Enlace a Registro -->
          <div class="mt-6 text-center">
            <span class="text-sm text-gray-600">
              ¿No tienes cuenta? 
              <button 
                type="button"
                (click)="goToRegister()"
                class="font-medium text-indigo-600 hover:text-indigo-500 ml-1"
              >
                Regístrate aquí
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  isSubmitted = false;

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async onSubmit() {
    this.isSubmitted = true;

    if (this.loginForm.invalid) {
      console.log('Formulario inválido');
      return;
    }

    this.isLoading = true;
    
    // Simulación de login
    setTimeout(() => {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      
      if (email === 'test@test.com' && password === '123456') {
        console.log('Login exitoso para:', email);
        alert('¡Bienvenido! Sesión iniciada correctamente');
        // Aquí irías al home: window.location.href = '/home';
      } else {
        console.log('Credenciales inválidas');
        alert('Email o contraseña incorrectos');
      }
      
      this.isLoading = false;
    }, 2000);
  }

  forgotPassword() {
    const email = prompt('Ingresa tu correo electrónico para recuperar tu contraseña:');
    if (email && this.isValidEmail(email)) {
      alert(`Se han enviado instrucciones a: ${email}`);
    } else {
      alert('Por favor ingresa un email válido');
    }
  }

  goToRegister() {
    // Aquí irías al registro: window.location.href = '/register';
    console.log('Ir a registro');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
