import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { NativeBiometric } from 'capacitor-native-biometric';
import { doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  documentType: 'CC' | 'CE' | 'TI' | 'PASSPORT';
  documentNumber: string;
  country: string;
  phone?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  requiresVerification?: boolean;
}

export interface BiometricResult {
  success: boolean;
  available: boolean;
  enrolled?: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly MIN_PASSWORD_LENGTH = 6;

  constructor(
    private afAuth: AngularFireAuth
  ) {}

  private getDb() {
    return getFirestore();
  }

  // REGISTRO DE USUARIO NUEVO
  async register(userData: RegisterData): Promise<AuthResult> {
    console.log('🔐 Iniciando registro con datos:', { ...userData, password: '[HIDDEN]' });

    try {
      // Validar datos
      const validation = this.validateRegisterData(userData);
      if (!validation.isValid) {
        console.log('❌ Validación fallida:', validation.errors);
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      console.log('✅ Validación exitosa, creando usuario en Firebase Auth...');

      // Crear usuario en Firebase Auth
      const credential = await this.afAuth.createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );

      const user = credential.user;
      if (!user) {
        console.log('❌ Usuario no creado en Firebase Auth');
        return {
          success: false,
          error: 'No se pudo crear el usuario'
        };
      }

      console.log('✅ Usuario creado en Firebase Auth con UID:', user.uid);

      // Actualizar displayName
      const displayName = `${userData.firstName} ${userData.lastName}`;
      await user.updateProfile({ displayName });
      console.log('✅ DisplayName actualizado:', displayName);

      // Enviar email de verificación
      await user.sendEmailVerification();
      console.log('✅ Email de verificación enviado');

      // Guardar datos adicionales en Firestore
      const { password, ...userProfile } = userData;
      const firestoreData = {
        uid: user.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        documentType: userData.documentType,
        documentNumber: userData.documentNumber,
        country: userData.country,
        phone: userData.phone || null,
        balance: 0,
        biometricEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false
      };

      console.log('📝 Guardando en Firestore con UID:', user.uid);
      console.log('📝 Datos a guardar:', firestoreData);

      try {
        const db = this.getDb();
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, firestoreData);
        console.log('✅ Documento guardado exitosamente en Firestore');
      } catch (firestoreError: any) {
        console.error('❌ Error al guardar en Firestore:', firestoreError);
        throw firestoreError;
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email!,
          displayName: displayName,
          emailVerified: user.emailVerified
        },
        requiresVerification: true
      };

    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      console.error('❌ Código de error:', error?.code || '(sin código)');
      console.error('❌ Mensaje de error:', error?.message || error);
      return {
        success: false,
        error: this.getAuthErrorMessage(error?.code)
      };
    }
  }

  // LOGIN CON EMAIL Y CONTRASEÑA
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Validar credenciales
      const validation = this.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const credential = await this.afAuth.signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      const user = credential.user;
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Actualizar último login en Firestore
      const db = this.getDb();
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          emailVerified: user.emailVerified
        }
      };

    } catch (error: any) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code)
      };
    }
  }

  // LOGIN CON GOOGLE
  async loginWithGoogle(): Promise<AuthResult> {
    try {
      // Autenticar con Google
      const googleUser = await GoogleSignIn.signIn();
      
      if (!googleUser || !googleUser.email) {
        return {
          success: false,
          error: 'No se pudo obtener la información de Google'
        };
      }

      // Para simplificar, usamos el email de Google para crear/actualizar el usuario
      // En producción, necesitarías configurar correctamente Firebase con Google Sign-In
      const db = this.getDb();
      const userDoc = await getDoc(doc(db, 'users', googleUser.email));
      
      if (!userDoc.exists()) {
        // Crear nuevo perfil de usuario para Google Sign-In
        const name = googleUser.displayName || 'Usuario Google';
        const firstName = name.split(' ')[0];
        const lastName = name.split(' ').slice(1).join(' ') || '';

        await setDoc(doc(db, 'users', googleUser.email), {
          uid: googleUser.email, // Usamos email como UID temporal
          email: googleUser.email,
          firstName,
          lastName,
          documentType: 'CC' as const,
          documentNumber: 'GOOGLE_AUTH',
          country: 'Colombia',
          phone: null,
          balance: 0,
          biometricEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          emailVerified: true,
          authProvider: 'google'
        });

        return {
          success: true,
          user: {
            uid: googleUser.email,
            email: googleUser.email,
            displayName: name,
            emailVerified: true
          }
        };
      } else {
        // Actualizar último login
        await updateDoc(doc(db, 'users', googleUser.email), {
          lastLoginAt: new Date(),
          updatedAt: new Date()
        });

        const userData = userDoc.data() as any;
        return {
          success: true,
          user: {
            uid: userData.uid,
            email: userData.email,
            displayName: `${userData.firstName} ${userData.lastName}`,
            emailVerified: userData.emailVerified
          }
        };
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error en autenticación con Google'
      };
    }
  }

  // LOGOUT
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      await GoogleSignIn.signOut();
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  // OBTENER USUARIO ACTUAL
  getCurrentUser(): Observable<AuthUser | null> {
    return this.afAuth.authState.pipe(
      map(user => {
        if (!user) return null;
        
        return {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          emailVerified: user.emailVerified
        };
      })
    );
  }

  // ENVIAR EMAIL DE VERIFICACIÓN
  async sendEmailVerification(): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user && !user.emailVerified) {
      await user.sendEmailVerification();
    }
  }

  // REENVIAR EMAIL DE VERIFICACIÓN
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      // Para reenviar, primero necesitamos obtener el usuario
      // Firebase no permite reenviar directamente sin autenticación previa
      const methods = await this.afAuth.fetchSignInMethodsForEmail(email);
      if (methods.length > 0) {
        // El usuario existe, pero necesita estar autenticado para reenviar
        throw new Error('Debe iniciar sesión para reenviar el email de verificación');
      }
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // RECUPERAR CONTRASEÑA
  async resetPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // CAMBIAR CONTRASEÑA
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.afAuth.currentUser;
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Verificar contraseña actual
      const credential = await this.afAuth.signInWithEmailAndPassword(
        user.email!,
        currentPassword
      );

      if (!credential.user) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Validar nueva contraseña
      if (newPassword.length < this.MIN_PASSWORD_LENGTH) {
        throw new Error(`La contraseña debe tener al menos ${this.MIN_PASSWORD_LENGTH} caracteres`);
      }

      // Cambiar contraseña
      await user.updatePassword(newPassword);

    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // VERIFICAR DISPONIBILIDAD DE BIOMETRÍA
  async checkBiometricAvailability(): Promise<BiometricResult> {
    try {
      const result = await NativeBiometric.isAvailable();
      
      return {
        success: true,
        available: result.isAvailable,
        enrolled: result.biometryType ? true : false
      };
    } catch (error: any) {
      return {
        success: false,
        available: false,
        error: error.message || 'Error verificando biometría'
      };
    }
  }

  // ENROLAR BIOMETRÍA
  async enrollBiometric(userId: string, password: string): Promise<BiometricResult> {
    try {
      // Verificar disponibilidad
      const availability = await this.checkBiometricAvailability();
      if (!availability.available) {
        return {
          success: false,
          available: false,
          error: 'La biometría no está disponible en este dispositivo'
        };
      }

      // Verificar contraseña del usuario
      const user = await this.afAuth.currentUser;
      if (!user) {
        return {
          success: false,
          available: true,
          error: 'Usuario no autenticado'
        };
      }

      const credential = await this.afAuth.signInWithEmailAndPassword(
        user.email!,
        password
      );

      if (!credential.user) {
        return {
          success: false,
          available: true,
          error: 'Contraseña incorrecta'
        };
      }

      // Crear credencial biométrica
      await NativeBiometric.setCredentials({
        username: userId,
        password: user.uid, // Usamos el UID como "contraseña" biométrica
        server: 'mydigitalwallet.app'
      });

      // Actualizar perfil del usuario
      const db = this.getDb();
      await updateDoc(doc(db, 'users', userId), {
        biometricEnabled: true,
        biometricEnrolledAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        available: true,
        enrolled: true
      };

    } catch (error: any) {
      return {
        success: false,
        available: true,
        error: error.message || 'Error enrolando biometría'
      };
    }
  }

  // AUTENTICAR CON BIOMETRÍA
  async authenticateWithBiometric(): Promise<AuthResult> {
    try {
      const result = await NativeBiometric.getCredentials({
        server: 'mydigitalwallet.app'
      });

      if (!result) {
        return {
          success: false,
          error: 'No se encontraron credenciales biométricas'
        };
      }

      // Autenticar con el UID almacenado
      // Como no podemos obtener el email directamente, necesitamos buscarlo en Firestore
      const db = this.getDb();
      const userDoc = await getDoc(doc(db, 'users', result.username));
      
      if (!userDoc.exists()) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      const userData = userDoc.data() as any;
      
      // Para completar la autenticación, necesitamos el email y contraseña
      // Esta es una implementación simplificada - en producción necesitarías
      // un flujo más seguro con tokens de refresh
      return {
        success: true,
        user: {
          uid: userData.uid,
          email: userData.email,
          displayName: `${userData.firstName} ${userData.lastName}`,
          emailVerified: userData.emailVerified
        }
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error en autenticación biométrica'
      };
    }
  }

  // ELIMINAR CREDENCIALES BIOMÉTRICAS
  async removeBiometricCredentials(): Promise<void> {
    try {
      await NativeBiometric.deleteCredentials({
        server: 'mydigitalwallet.app'
      });
    } catch (error) {
      console.error('Error eliminando credenciales biométricas:', error);
      // No lanzar error para no interrumpir el flujo
    }
  }

  // DESHABILITAR BIOMETRÍA
  async disableBiometric(userId: string): Promise<void> {
    try {
      await this.removeBiometricCredentials();
      const db = this.getDb();
      await updateDoc(doc(db, 'users', userId), {
        biometricEnabled: false,
        biometricDisabledAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deshabilitando biometría:', error);
      throw error;
    }
  }

  // VERIFICAR SI EL EMAIL ESTÁ VERIFICADO
  async isEmailVerified(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    return user?.emailVerified || false;
  }

  // ACTUALIZAR PERFIL DE USUARIO
  async updateProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      await user.updateProfile(data);
    }
  }

  // MÉTODOS DE VALIDACIÓN
  private validateRegisterData(data: RegisterData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push('Email inválido');
    }

    // Validar contraseña
    if (!data.password || data.password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`La contraseña debe tener al menos ${this.MIN_PASSWORD_LENGTH} caracteres`);
    }

    // Validar nombre
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    // Validar apellido
    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }

    // Validar tipo de documento
    const validDocTypes = ['CC', 'CE', 'TI', 'PASSPORT'];
    if (!data.documentType || !validDocTypes.includes(data.documentType)) {
      errors.push('Tipo de documento inválido');
    }

    // Validar número de documento
    if (!data.documentNumber || data.documentNumber.trim().length < 5) {
      errors.push('El número de documento debe tener al menos 5 caracteres');
    }

    // Validar país
    if (!data.country || data.country.trim().length < 2) {
      errors.push('El país es requerido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateLoginCredentials(credentials: LoginCredentials): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!credentials.email || !emailRegex.test(credentials.email)) {
      errors.push('Email inválido');
    }

    if (!credentials.password) {
      errors.push('La contraseña es requerida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private getAuthErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión',
      'auth/requires-recent-login': 'Requiere inicio de sesión reciente',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/credential-already-in-use': 'Las credenciales ya están en uso',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/expired-action-code': 'Código de acción expirado',
      'auth/invalid-action-code': 'Código de acción inválido'
    };

    return errorMessages[errorCode] || 'Error de autenticación';
  }

  // OBSERVABLES DE ESTADO
  get authState$(): Observable<any | null> {
    return this.afAuth.authState;
  }

  get user$(): Observable<AuthUser | null> {
    return this.getCurrentUser();
  }

  // VERIFICAR SI HAY SESIÓN ACTIVA
  isAuthenticated(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => user !== null)
    );
  }

  // OBTENER UID DEL USUARIO ACTUAL
  async getCurrentUserId(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user?.uid || null;
  }
}
