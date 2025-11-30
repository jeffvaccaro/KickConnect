import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StaffService { 
  
  private accountCodeSubject = new BehaviorSubject<string>('');
  private accountIdSubject = new BehaviorSubject<string>('');
  private userNameSubject = new BehaviorSubject<string>('');
  private staffIdSubject = new BehaviorSubject<string>('');
  private roleNameSubject = new BehaviorSubject<string>('');

  private apiUrl = `${environment.apiUrl}/staff`;

  constructor(private http: HttpClient) {
    const storedAccountCode = localStorage.getItem('accountCode') || '';
    const storedAccountId = localStorage.getItem('accountId') || '';
    const storedUserName = localStorage.getItem('userName') || '';
    const storedstaffId = localStorage.getItem('staffId') || '';
    const storedRoleName = localStorage.getItem('role') || '';
    // console.log('Stored role:', storedRoleName);
    this.accountCodeSubject = new BehaviorSubject<string>(storedAccountCode);
    this.accountIdSubject = new BehaviorSubject<string>(storedAccountId);
    this.userNameSubject = new BehaviorSubject<string>(storedUserName);
    this.staffIdSubject = new BehaviorSubject<string>(storedstaffId);
    this.roleNameSubject = new BehaviorSubject<string>(storedRoleName);
  }
  
  
  setStaffName(userNameValue: string): void {
    localStorage.setItem('userName', userNameValue);
    this.userNameSubject.next(userNameValue);
  }

  setStaffId(staffIdValue: string): void {
    localStorage.setItem('staffId', staffIdValue);
    this.staffIdSubject.next(staffIdValue);
  }

  getStaffName() {
    return this.userNameSubject.asObservable();
  }

  getStaffId() {
    return this.staffIdSubject.asObservable();
  }

  setAccountCode(accountCodeValue: string): void {
    localStorage.setItem('accountCode', accountCodeValue);
    this.accountCodeSubject.next(accountCodeValue);
  }

  getAccountCode() {
    return this.accountCodeSubject.asObservable();
  }

  setAccountId(accountIdValue: string): void {
    localStorage.setItem('accountId', accountIdValue);
    this.accountIdSubject.next(accountIdValue);
  }

  getAccountId() {
    return this.accountIdSubject.asObservable();
  }

  getRoleName(): Observable<string> {
    return this.roleNameSubject.asObservable();
  }

  setRoleName(roleNameValue: string): void {
    const currentRole = this.roleNameSubject.getValue();
    if (currentRole !== roleNameValue) {
      console.log('Setting role to:', roleNameValue);
      localStorage.setItem('role', roleNameValue);
      this.roleNameSubject.next(roleNameValue);
    }
  }
  
  getStaff(staffId: number): Observable<any> {
    const url = `${this.apiUrl}/get-staff-by-id`;
    const params = new HttpParams().set('staffId', staffId.toString());
    return this.http.get<any>(url, { params });
  }

  getAllStaff(accountCode: string): Observable<any> {
    const url = `${this.apiUrl}/get-staff`;
    const params = new HttpParams().set('accountCode', accountCode);
    return this.http.get<any>(url, { params });
  }

  getSuperUserAllStaff(): Observable<any> {
    const url = `${this.apiUrl}/get-all-staff`;
    return this.http.get<any>(url);
  }
  
  getStaffsByStatus(accountId: number, status: string): Observable<any> {
    const url = `${this.apiUrl}/get-filtered-staff`;
    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('status', status);
    return this.http.get<any>(url, { params });
  }

  getStaffsByRole(roleId: number): Observable<any>{
    const url = `${this.apiUrl}/get-staff-by-role`;
    const params = new HttpParams()
      .set('roleId', roleId.toString())
    return this.http.get<any>(url, { params });
  }

  getStaffsByLocationAndRole(roleId: number, locationId: number): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/get-staff-by-location-role/${roleId}/${locationId}`);
  }
  
  updateStaff(staffId: number, body: FormData | any) {
    const url = `${this.apiUrl}/update-staff/${staffId}`;
    return this.http.put(url, body);
  }

  updateProfile(staffId: number, profileData: any) {
    //console.log('Service Called', profileData);
    return this.http.put(`${this.apiUrl}/update-profile/${staffId}`, profileData);
  }
  
  updateStaffPassword(accountCode: string, staffId: number, accountId: number, userData: any) {
    // Nest userData inside an object
    return this.http.put(`${this.apiUrl}/update-staff-password/${accountCode}/${staffId}/${accountId}`, { userData });
  }

  addStaff(formData: FormData) {
    return this.http.post(`${this.apiUrl}/add-user`, formData);
  }

  insertProfileAssignment(scheduleLocationId: number, primaryProfileId: number, altProfileId?: number) {

    const altProfileIdValue = altProfileId !== undefined && altProfileId !== null ? altProfileId : 'null';
    const url = `${this.apiUrl}/upsert-profile-assignment/${scheduleLocationId}/${primaryProfileId}/${altProfileIdValue}`;
    
    const request = this.http.post(url, {});
  
    request.subscribe({
      next: response => {
        console.log('Post request successful:', response);
      },
      error: error => {
        console.error('Post request failed:', error);
      }
    });
  
    return request;
  }
  
  
  
  sendStaffResetLink(staffId: string, accountcode: string): Observable<any> {
    const url = `${this.apiUrl}/send-staff-reset-link`;
    const params = new HttpParams().set('staffId', staffId.toString()).set('accountCode', accountcode.toString());
    return this.http.get<any>(url, { params });
  }
}
