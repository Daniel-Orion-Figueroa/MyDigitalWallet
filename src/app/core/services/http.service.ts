import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  reportProgress?: boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  withCredentials?: boolean;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;

  constructor(private http: HttpClient) {}

  // GET request
  get<T = any>(
    url: string,
    options?: HttpOptions,
    retries: number = this.MAX_RETRIES
  ): Observable<T> {
    const requestOptions = this.buildOptions(options) as any;

    return (this.http.get<T>(url, requestOptions) as Observable<T>).pipe(
      timeout(options?.timeout || this.DEFAULT_TIMEOUT),
      retry(retries),
      catchError(this.handleError)
    );
  }

  // POST request
  post<T = any>(
    url: string,
    body: any,
    options?: HttpOptions,
    retries: number = this.MAX_RETRIES
  ): Observable<T> {
    const requestOptions = this.buildOptions(options) as any;

    return (this.http.post<T>(url, body, requestOptions) as Observable<T>).pipe(
      timeout(options?.timeout || this.DEFAULT_TIMEOUT),
      retry(retries),
      catchError(this.handleError)
    );
  }

  // PUT request
  put<T = any>(
    url: string,
    body: any,
    options?: HttpOptions,
    retries: number = this.MAX_RETRIES
  ): Observable<T> {
    const requestOptions = this.buildOptions(options) as any;

    return (this.http.put<T>(url, body, requestOptions) as Observable<T>).pipe(
      timeout(options?.timeout || this.DEFAULT_TIMEOUT),
      retry(retries),
      catchError(this.handleError)
    );
  }

  // PATCH request
  patch<T = any>(
    url: string,
    body: any,
    options?: HttpOptions,
    retries: number = this.MAX_RETRIES
  ): Observable<T> {
    const requestOptions = this.buildOptions(options) as any;

    return (this.http.patch<T>(url, body, requestOptions) as Observable<T>).pipe(
      timeout(options?.timeout || this.DEFAULT_TIMEOUT),
      retry(retries),
      catchError(this.handleError)
    );
  }

  // DELETE request
  delete<T = any>(
    url: string,
    options?: HttpOptions,
    retries: number = this.MAX_RETRIES
  ): Observable<T> {
    const requestOptions = this.buildOptions(options) as any;

    return (this.http.delete<T>(url, requestOptions) as Observable<T>).pipe(
      timeout(options?.timeout || this.DEFAULT_TIMEOUT),
      retry(retries),
      catchError(this.handleError)
    );
  }

  // Build HTTP options
  private buildOptions(options?: HttpOptions): any {
    const defaultHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return {
      headers: options?.headers || defaultHeaders,
      params: options?.params,
      reportProgress: options?.reportProgress || false,
      responseType: options?.responseType || 'json',
      withCredentials: options?.withCredentials || false,
      observe: 'body' as const
    };
  }

  // Error handling
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && typeof error.error === 'object') {
        errorMessage = error.error.message || error.error.error || errorMessage;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = 'No autorizado';
            break;
          case 403:
            errorMessage = 'Acceso prohibido';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.statusText}`;
        }
      }
    }

    console.error('HTTP Error:', error);
    return throwError(() => new Error(errorMessage));
  };

  // API endpoints for notifications
  private readonly NOTIFICATIONS_API = environment.notificationApiUrl;

  private buildAuthHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', token);
    }

    return headers;
  }

  // Authenticate against the notifications backend and return the JWT token
  loginToNotificationApi(email: string, password: string): Observable<ApiResponse<{ token: string }>> {
    const payload = { email, password };
    return this.post<ApiResponse<{ token: string }>>(`${this.NOTIFICATIONS_API}/user/login`, payload);
  }

  // Send push notification via the backend API
  sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
    token?: string
  ): Observable<ApiResponse> {
    const payload = {
      token: fcmToken,
      notification: {
        title,
        body
      },
      android: {
        priority: 'high',
        data: data || {}
      }
    };

    return this.post<ApiResponse>(`${this.NOTIFICATIONS_API}/notifications/`, payload, {
      headers: this.buildAuthHeaders(token)
    });
  }

  // Send generic notification (useful for future types)
  sendNotification(payload: any, token?: string): Observable<ApiResponse> {
    return this.post<ApiResponse>(`${this.NOTIFICATIONS_API}/notifications/`, payload, {
      headers: this.buildAuthHeaders(token)
    });
  }
}