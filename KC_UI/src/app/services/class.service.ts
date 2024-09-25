import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = 'http://localhost:3000/class/';

  constructor(private http: HttpClient)  { }

  // getLocations(status:string): Observable<any> {
  //   let url = `${this.apiUrl}`;
  //   switch (status) {
  //     case 'Active':
  //       url = `${this.apiUrl}/get-active-locations`;
  //       break;
  //     case 'InActive':
  //       url = `${this.apiUrl}/get-inactive-locations`;
  //       break;
  //     default:
  //       url = `${this.apiUrl}/get-locations`;
  //       break;
  //   } 
    
  //   return this.http.get<any>(url);
  // }

  getClasses(accountId: number): Observable<any> {
    const url = `${this.apiUrl}/get-class-list/${accountId}`;
    return this.http.get<any>(url);
  }

  getClassById(accountId: number, classId: number): Observable<any> {
    const url = `${this.apiUrl}/get-class-by-id/${accountId}/${classId}`;
    return this.http.get<any>(url);
  }

  addClass(classData: any): Observable<any> {
    const url = `${this.apiUrl}/add-class`;
    return this.http.post<any>(url, classData);
  }
  
  updateClass(classId: number, classData: any) {
    return this.http.put(`${this.apiUrl}/update-class/${classId}`, classData);
  }

  deactivateClass(accountId: number, classId: number){
    return this.http.delete(`${this.apiUrl}/deactivate-class/${accountId}/${classId}`);
  }
}
