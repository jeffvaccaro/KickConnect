import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private apiUrl = 'http://localhost:3000/common';

  constructor(private http: HttpClient)  { }

  getCityState(zip:number): Observable<any> {
    const url = `${this.apiUrl}/get-address-info-by-zip/${zip}`;
    return this.http.get<any>(url);
  }
}
