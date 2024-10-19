
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { IDuration } from '../interfaces/duration';
import { IReservationCount } from '../interfaces/reservation-count';
import { environment } from '../../environments/environment';
import { ISchedule } from '../interfaces/schedule';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private apiUrl = environment.apiUrl + '/schedule'; 

  constructor(private http: HttpClient, private logger: LoggerService)  { }

  getDurations(): Observable<any> {
    let url = `${this.apiUrl}/get-durations`;
    return this.http.get<IDuration[]>(url).pipe(
      catchError(error => {
        this.logger.logError('Error getDurations', error);
        throw error;
      })
    );
  }

  getReservationCount(): Observable<any> {
    let url = `${this.apiUrl}/get-reservationCounts`;
    return this.http.get<IReservationCount[]>(url).pipe(
      catchError(error => {
        this.logger.logError('Error getReservationCount', error);
        throw error;
      })
    );

  }
  addScheduleEvent(eventData: any): Observable<any> {
    const url = `${this.apiUrl}/add-schedule`;
    return this.http.post<any>(url, eventData).pipe(
      map(response => {
        console.log('HTTP response:', response);
        if (response && response.scheduleMainId) {
          return response.scheduleMainId; // Return the scheduleMainId
        }
        return response;
      }),
      catchError(error => {
        this.logger.logError('Error addScheduleEvent', error);
        return of(null);
      })
    );
  }

  updateScheduleEvent(eventData: any): Observable<any>{
    console.log('Update Event Data:', eventData);
    const url = `${this.apiUrl}/update-schedule/${eventData.scheduleMainId}`;
    console.log('Making HTTP PUT request to:', url);

    return this.http.put<any>(url, eventData).pipe(
      catchError(error => {
        this.logger.logError('Error updateScheduleEvent', error);
        return of(null);
      })
    );
  }

  getSchedules(): Observable<any> {
    const url = `${this.apiUrl}/get-main-schedule`
    return this.http.get<ISchedule>(url).pipe(
      catchError(error => {
        this.logger.logError('Error getSchedules', error);
        return of(null);
      })
    );
  }

  deleteScheduleEvent(scheduleMainId: number): Observable<any> {
    const url = `${this.apiUrl}/delete-schedule-event/${scheduleMainId}`;
    console.log('URL:', url);
    return this.http.delete(url).pipe(
      map(response => response),
      catchError(error => {
        this.logger.logError('Error deleteScheduleEvent', error);
        return of(null);
      })
    );
  }
  

}