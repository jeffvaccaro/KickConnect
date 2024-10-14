import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { concat, Observable, throwError } from 'rxjs';
import { catchError, delay, retryWhen, take, throwIfEmpty } from 'rxjs/operators';
import { ModalService } from '../services/modal.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private modalService: ModalService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');
    const cloned = token ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }) : req;

    return next.handle(cloned).pipe(
      retryWhen(errors => errors.pipe(
        delay(1000), // Initial delay
        take(3), // Retry 3 times
        throwIfEmpty(() => throwError(new Error('Failed after 3 retries'))) // Throw error after retries
      )),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.snackBar.open('Session expired. Please log in again.', 'OK', { duration: 3000 });
          setTimeout(() => {
            this.router.navigate(['/authentication']);
          }, 3000); // Delay navigation to allow snackBar display
        } else if (error.status >= 500) {
          this.snackBar.open('Server error. Redirecting...', 'OK', { duration: 3000 });
          setTimeout(() => {
            this.router.navigate(['/error']);
          }, 3000); // Delay navigation to allow snackBar display
        } else if (!navigator.onLine) {
          this.snackBar.open('No internet connection. Redirecting...', 'OK', { duration: 3000 });
          setTimeout(() => {
            this.router.navigate(['/error']);
          }, 3000); // Delay navigation to allow snackBar display
        } else if (error.status >= 400 && error.status < 500) {
          this.modalService.openModal(); // Use modal service only for client errors
        } else {
          this.snackBar.open('An unexpected error occurred. Please try again.', 'OK', { duration: 3000 });
          setTimeout(() => {
            this.router.navigate(['/error']);
          }, 3000); // Delay navigation to allow snackBar display
        }
        return throwError(() => new Error(error.message)); // Updated to new throwError syntax
      })
    );
  }
}
