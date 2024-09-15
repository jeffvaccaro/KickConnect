import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ModalService } from '../services/modal.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private modalService: ModalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');
    //console.log('Token:', token); // Add this line for logging
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      // console.log('Cloned Request Headers:', cloned.headers); // Add this line for logging
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.modalService.openModal();
          }
          return throwError(error);
        })
      );
    } else {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.modalService.openModal();
          }
          return throwError(error);
        })
      );
    }
  }
}
