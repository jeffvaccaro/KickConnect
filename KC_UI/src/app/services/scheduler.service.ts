
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Duration } from '../interfaces/duration';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private apiUrl = 'http://localhost:3000/schedule';

  constructor(private http: HttpClient)  { }

  getDurations(): Observable<any> {
    let url = `${this.apiUrl}/get-durations`;
    return this.http.get<Duration[]>(url);
  }
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

  // getLocationsById(locationId: number): Observable<any> {
  //   const url = `${this.apiUrl}/get-locations-by-id/${locationId}`;
  //   return this.http.get<any>(url);
  // }

  // addLocation(locationData: any): Observable<any> {
  //   const url = `${this.apiUrl}/add-location`;
  //   return this.http.post<any>(url, locationData);
  // }
  
  // updateLocation(locationId: number, locationData: any) {
  //   return this.http.put(`${this.apiUrl}/update-location/${locationId}`, locationData);
  // }
}
