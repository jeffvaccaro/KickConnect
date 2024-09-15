import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/location/';

  constructor(private http: HttpClient)  { }

  getLocations(): Observable<any> {
    const url = `${this.apiUrl}/get-locations`;
    return this.http.get<any>(url);
  }

  getLocationsById(locationId: number): Observable<any> {
    const url = `${this.apiUrl}/get-locations-by-id/${locationId}`;;
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
