import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  private tokenKey = 'authToken';
  private tokenExpirationKey = 'tokenExpiration';

  isAuthenticated(): boolean {
    const token = this.getToken();
    const explicitExpiration = this.getTokenExpiration();

    if (!token) {
      return false;
    }

    // Prefer explicit expiration if stored
    if (explicitExpiration) {
      const stillValid = new Date().getTime() < new Date(explicitExpiration).getTime();
      if (!stillValid) {
        this.removeToken();
      }
      return stillValid;
    }

    // Fallback: decode JWT `exp` from token
    const expMs = this.decodeJwtExpMs(token);
    if (expMs) {
      const stillValid = new Date().getTime() < expMs;
      if (!stillValid) {
        this.removeToken();
      }
      return stillValid;
    }

    // No usable expiration info -> treat as unauthenticated (force fresh login)
    this.removeToken();
    return false;
  }

  setToken(token: string, expiration: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.tokenExpirationKey, expiration);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getTokenExpiration(): string | null {
    return localStorage.getItem(this.tokenExpirationKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenExpirationKey);
  }

  private decodeJwtExpMs(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payloadJson = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payloadJson.exp) return null;
      // `exp` is seconds since epoch; convert to ms
      return Number(payloadJson.exp) * 1000;
    } catch {
      return null;
    }
  }
}
