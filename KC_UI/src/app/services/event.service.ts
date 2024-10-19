import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = environment.apiUrl + '/event'; 
  constructor(private http: HttpClient)  { }

  getEvents(accountId: number): Observable<any> {
    const url = `${this.apiUrl}/get-event-list/${accountId}`;
    return this.http.get<any>(url);
  }

  getActiveEvents(accountId: number): Observable<any> {
    const url = `${this.apiUrl}/get-active-event-list/${accountId}`;
    return this.http.get<any>(url);
  }

  getEventById(accountId: number, eventId: number): Observable<any> {
    const url = `${this.apiUrl}/get-event-by-id/${accountId}/${eventId}`;
    return this.http.get<any>(url);
  }

  addEvent(eventData: any): Observable<any> {
    const url = `${this.apiUrl}/add-event`;
    console.log('addevent', eventData);
    return this.http.post<any>(url, eventData).pipe(
      map(response => {
        console.log('event added successfully:', response);
        if (response && response.eventId) {
          return response.eventId; // Return the eventId
        }
        return response;
      }),
      catchError(error => {
        console.error('Error occurred in HTTP call:', error);
        return of(null);
      })
    );
  }
  
  
  updateEvent(eventId: number, eventData: any) {
    return this.http.put(`${this.apiUrl}/update-event/${eventId}`, eventData);
  }

  deactivateEvent(accountId: number, eventId: number){
    return this.http.delete(`${this.apiUrl}/deactivate-event/${accountId}/${eventId}`);
  }
}
