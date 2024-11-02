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
    const currentPath = route.routeConfig?.path || '';
    const publicRoutes = ['authentication/register', 'authentication/reset-password'];

    console.log('Current path:', currentPath);
    console.log('Is authenticated:', isAuthenticated);
    console.log('Query params:', route.queryParams);

    if (publicRoutes.includes(currentPath)) {
      console.log('Allowed public route:', currentPath);
      return true;
    }

    if (isAuthenticated) {
      return true;
    } else {
      console.log('AuthGuard: Redirecting to authentication');
      this.router.navigate(['/authentication']);
      return false;
    }
  }
}
