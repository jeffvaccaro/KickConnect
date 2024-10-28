import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/authService';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    // console.log('AuthGuard: Checking route', route.routeConfig?.path); // Log the path being checked
    // console.log('AuthGuard: isAuthenticated =', isAuthenticated); // Log the authentication status
    
    // Allow access to the registration route even if not authenticated
    if (route.routeConfig?.path === 'authentication/register') {
      // console.log('AuthGuard: Allowing access to registration');
      return true;
    }

    if (isAuthenticated) {
      return true;
    } else {
      // console.log('AuthGuard: Redirecting to authentication');
      this.router.navigate(['/authentication']); 
      return false;
    }
  }
}
