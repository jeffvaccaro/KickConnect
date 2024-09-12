import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/authService';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('AuthGuard: isAuthenticated =', isAuthenticated);
    if (isAuthenticated) {
      return true;
    } else {
      this.router.navigate(['/authentication']);
      return false;
    }
  }
}
