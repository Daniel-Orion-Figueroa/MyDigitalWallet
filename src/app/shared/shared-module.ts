import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Importar componentes Ionic
import { IonicModule } from '@ionic/angular';
import { LoginComponent } from './components/login/login-simple.component';

// Importar componentes standalone

@NgModule({
  declarations: [], // Los componentes standalone no necesitan declararse
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IonicModule,
    
    LoginComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,

    LoginComponent
  ]
})
export class SharedModule { }
