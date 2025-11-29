import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { LoggerService } from './logger.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembershipPlansService {
  private apiUrl = environment.apiUrl + '/membershipPlan';
  constructor(private http: HttpClient, private logger: LoggerService) {}
  
    getMembershipPlans(): Observable<any> {
    console.log('Fetching membership plans from API');
    const url = `${this.apiUrl}/get-all-plans`;

    return this.http.get<any>(url).pipe(
      catchError(error => {
        this.logger.logError('Error fetching membership plans', error);
        throw error;
      })
    );
  }

  addMembershipPlan(planData: any): Observable<any> {
    console.log('Adding a new membership plan to API');
    const url = `${this.apiUrl}/add-plan`;  
    return this.http.post<any>(url, planData).pipe(
      catchError(error => {
        this.logger.logError('Error adding membership plan', error);
        throw error;
      })
    );
  }
}
