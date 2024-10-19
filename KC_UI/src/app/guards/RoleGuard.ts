import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private roleService: RoleService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const expectedRoles: string[] = route.data['expectedRoles'];
    
    return this.roleService.getRoles().pipe(
      map(userRoles => {
        const hasRole = userRoles.some((role: string) => expectedRoles.includes(role));
        
        if (!hasRole) {
          this.router.navigate(['not-authorized']);
        }
        
        return hasRole;
      }),
      catchError(() => {
        this.router.navigate(['not-authorized']);
        return [false];
      })
    );
  }
}
