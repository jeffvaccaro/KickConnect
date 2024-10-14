
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { IDuration } from '../interfaces/duration';
import { environment } from '../../environments/environment';
import { ISchedule } from '../interfaces/schedule';
@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private apiUrl = environment.apiUrl + '/schedule'; 

  constructor(private http: HttpClient)  { }

  getDurations(): Observable<any> {
    let url = `${this.apiUrl}/get-durations`;
    return this.http.get<IDuration[]>(url);
  }

  addScheduleEvent(eventData: any): Observable<any> {
    const url = `${this.apiUrl}/add-schedule`;
    console.log('Making HTTP POST request to:', url);

    return this.http.post<any>(url, eventData).pipe(
      catchError(error => {
        console.error('Error occurred in HTTP call:', error);
        return of(null);
      })
    );
  }

  getSchedules(locationId: number): Observable<any> {
    const url = `${this.apiUrl}/get-schedule-by-location/${locationId}`
    return this.http.get<ISchedule>(url).pipe(
      catchError(error => {
        console.error('Error occurred in HTTP call:', error);
        return of(null);
      })
    );
  }
}