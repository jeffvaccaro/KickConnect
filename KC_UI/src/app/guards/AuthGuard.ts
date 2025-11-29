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
    // Public (unguarded) routes: add error pages so server errors don't force logout/login cycle
    const publicRoutes = ['register', 'reset-password', 'error', 'error-500'];
  
    if (publicRoutes.includes(currentPath)) {
      console.log('Allowed public route:', currentPath);
      return true;
    }
  
    if (isAuthenticated) {
      console.log('AuthGuard - isAuthenticated:', isAuthenticated);
      return true;
    } else {
      // Unauthenticated access to a protected route: send to logout (session end / timeout UX)
      console.log('AuthGuard: Unauthenticated – redirecting to logout');
      this.router.navigate(['logout']);
      return false;
    }
  }
  
}