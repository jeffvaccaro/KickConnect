import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = environment.apiUrl + '/location'; 

  constructor(private http: HttpClient)  { }

  getLocations(status:string): Observable<any> {
    let url = `${this.apiUrl}`;
    switch (status) {
      case 'Active':
        url = `${this.apiUrl}/get-active-locations`;
        break;
      case 'InActive':
        url = `${this.apiUrl}/get-inactive-locations`;
        break;
      default:
        url = `${this.apiUrl}/get-locations`;
        break;
    } 
    
    return this.http.get<any>(url);
  }

  getLocationsById(locationId: number): Observable<any> {
    const url = `${this.apiUrl}/get-locations-by-id/${locationId}`;
    return this.http.get<any>(url);
  }

  addLocation(locationData: any): Observable<any> {
    const url = `${this.apiUrl}/add-location`;
    return this.http.post<any>(url, locationData);
  }
  
  updateLocation(locationId: number, locationData: any) {
    return this.http.put(`${this.apiUrl}/update-location/${locationId}`, locationData);
  }
}
