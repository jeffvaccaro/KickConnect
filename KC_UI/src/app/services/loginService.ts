import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { normalizedApiBase } from './api-base';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = `${normalizedApiBase(environment.apiUrl)}/login/staff-login`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { email, password })
      .pipe(
        tap((response: any) => {
          // Align with AuthInterceptor/AuthService expectations
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          // Optional: store token expiration if provided by API
          if (response.tokenExpiration) {
            localStorage.setItem('tokenExpiration', response.tokenExpiration);
          }
        })
      );
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ token: string }>(`${normalizedApiBase(environment.apiUrl)}/login/refresh-token`, { refreshToken })
      .pipe(
        map(response => response.token),
        tap(newToken => {
          // Keep keys consistent for interceptor
          localStorage.setItem('authToken', newToken);
        })
      );
  }
}
