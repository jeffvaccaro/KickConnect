import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ClassObj } from '../objects/class/class-obj';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = environment.apiUrl + '/class'; 
  constructor(private http: HttpClient)  { }

  getClasses(accountId: number): Observable<any> {
    const url = `${this.apiUrl}/get-class-list/${accountId}`;
    return this.http.get<any>(url);
  }

  getActiveClasses(accountId: number): Observable<any> {
    const url = `${this.apiUrl}/get-active-class-list/${accountId}`;
    return this.http.get<any>(url);
  }

  getClassById(accountId: number, classId: number): Observable<any> {
    const url = `${this.apiUrl}/get-class-by-id/${accountId}/${classId}`;
    return this.http.get<any>(url);
  }

  addClass(classData: any): Observable<any> {
    const url = `${this.apiUrl}/add-class`;
    console.log('addClass', classData);
    return this.http.post<any>(url, classData).pipe(
      map(response => {
        console.log('Class added successfully:', response);
        if (response && response.classId) {
          return response.classId; // Return the classId
        }
        return response;
      }),
      catchError(error => {
        console.error('Error occurred in HTTP call:', error);
        return of(null);
      })
    );
  }
  
  
  updateClass(classId: number, classData: any) {
    return this.http.put(`${this.apiUrl}/update-class/${classId}`, classData);
  }

  deactivateClass(accountId: number, classId: number){
    return this.http.delete(`${this.apiUrl}/deactivate-class/${accountId}/${classId}`);
  }
}
