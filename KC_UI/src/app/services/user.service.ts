import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService { 
  
  private accountCodeSubject = new BehaviorSubject<string>('');
  private accountIdSubject = new BehaviorSubject<string>('');
  private userNameSubject = new BehaviorSubject<string>('');
  private roleNameSubject = new BehaviorSubject<string>('');

  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {
    const storedAccountCode = localStorage.getItem('accountCode') || '';
    const storedAccountId = localStorage.getItem('accountId') || '';
    const storedUserName = localStorage.getItem('userName') || '';
    const storedRoleName = localStorage.getItem('role') || '';
    // console.log('Stored role:', storedRoleName);
    this.accountCodeSubject = new BehaviorSubject<string>(storedAccountCode);
    this.accountIdSubject = new BehaviorSubject<string>(storedAccountId);
    this.userNameSubject = new BehaviorSubject<string>(storedUserName);
    this.roleNameSubject = new BehaviorSubject<string>(storedRoleName);
  }
  
  
  setUserName(userNameValue: string): void {
    localStorage.setItem('userName', userNameValue);
    this.userNameSubject.next(userNameValue);
  }

  getUserName() {
    return this.userNameSubject.asObservable();
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
  
  getUser(userId: number): Observable<any> {
    const url = `${this.apiUrl}/get-user-by-id`;
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<any>(url, { params });
  }

  getAllUsers(accountCode: string): Observable<any> {
    const url = `${this.apiUrl}/get-users`;
    const params = new HttpParams().set('accountCode', accountCode);
    return this.http.get<any>(url, { params });
  }

  getUsersByStatus(accountId: number, status: string): Observable<any> {
    const url = `${this.apiUrl}/get-filtered-users`;
    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('status', status);
    return this.http.get<any>(url, { params });
  }
  
  updateUser(userId: number, formData: FormData) {
    return this.http.put(`${this.apiUrl}/update-user/${userId}`, formData);
  }
  
  updateUserPassword(accountCode: string, userId: number, accountId: number, userData: any) {
    // Nest userData inside an object
    return this.http.put(`${this.apiUrl}/update-user-password/${accountCode}/${userId}/${accountId}`, { userData });
  }


  addUser(formData: FormData) {
    return this.http.post(`${this.apiUrl}/add-user`, formData);
  }
}
