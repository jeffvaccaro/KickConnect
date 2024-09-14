import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/location/get-locations';

  constructor(private http: HttpClient)  { }

  getLocations(): Observable<any> {
    // const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<any>(this.apiUrl);
  }
}
