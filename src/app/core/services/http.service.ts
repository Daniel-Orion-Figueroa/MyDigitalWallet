import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, retry } from 'rxjs/operators';

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
    const requestOptions = this.buildOptions(options);

    return this.http.get<T>(url, requestOptions).pipe(
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
    const requestOptions = this.buildOptions(options);

    return this.http.post<T>(url, body, requestOptions).pipe(
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
    const requestOptions = this.buildOptions(options);

    return this.http.put<T>(url, body, requestOptions).pipe(
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
    const requestOptions = this.buildOptions(options);

    return this.http.patch<T>(url, body, requestOptions).pipe(
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
    const requestOptions = this.buildOptions(options);

    return this.http.delete<T>(url, requestOptions).pipe(
      timeout(options?.timeout || this.DEFAULT_TIMEOUT),
      retry(retries),
      catchError(this.handleError)
    );
  }

  // Build HTTP options
  private buildOptions(options?: HttpOptions): HttpOptions {
    const defaultHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return {
      headers: options?.headers || defaultHeaders,
      params: options?.params,
      reportProgress: options?.reportProgress || false,
      responseType: options?.responseType || 'json',
      withCredentials: options?.withCredentials || false
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
  private readonly NOTIFICATIONS_API = 'https://api.mydigitalwallet.com/notifications';

  // Send push notification
  sendPushNotification(
    userId: string,
    title: string,
    message: string,
    data?: any
  ): Observable<ApiResponse> {
    const payload = {
      userId,
      title,
      message,
      data,
      type: 'push'
    };

    return this.post<ApiResponse>(`${this.NOTIFICATIONS_API}/push`, payload);
  }

  // Send email notification
  sendEmailNotification(
    userId: string,
    subject: string,
    body: string,
    template?: string
  ): Observable<ApiResponse> {
    const payload = {
      userId,
      subject,
      body,
      template,
      type: 'email'
    };

    return this.post<ApiResponse>(`${this.NOTIFICATIONS_API}/email`, payload);
  }

  // Send SMS notification
  sendSMSNotification(
    userId: string,
    message: string
  ): Observable<ApiResponse> {
    const payload = {
      userId,
      message,
      type: 'sms'
    };

    return this.post<ApiResponse>(`${this.NOTIFICATIONS_API}/sms`, payload);
  }

  // Get notification history
  getNotificationHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.get<ApiResponse>(`${this.NOTIFICATIONS_API}/history`, { params });
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): Observable<ApiResponse> {
    return this.patch<ApiResponse>(`${this.NOTIFICATIONS_API}/${notificationId}/read`, {});
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<ApiResponse> {
    return this.delete<ApiResponse>(`${this.NOTIFICATIONS_API}/${notificationId}`);
  }
}