import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { catchError, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class MembershipService {
  private apiUrl = environment.apiUrl + '/membership';

    constructor(private http: HttpClient, private logger: LoggerService) {}

    getMembers(): Observable<any> {
    const url = `${this.apiUrl}/get-all-members`;

    return this.http.get<any>(url).pipe(
      catchError(error => {
        this.logger.logError('Error fetching members', error);
        throw error;
      })
    );
  }

  addMember(memberData: any): Observable<any> {
    const url = `${this.apiUrl}/add-member`;
    console.log('memberData',memberData);
    return this.http.post<any>(url, memberData).pipe(
      catchError(error => {
        this.logger.logError('Error Adding Member', error);
        throw error;
      })
    );
  }

}