import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/user/get-user-by-id';
  
  private accountCodeSubject = new BehaviorSubject<string>('');
  private userNameSubject = new BehaviorSubject<string>('');
  private roleNameSubject = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {
    const storedAccountCode = localStorage.getItem('accountCode') || '';
    const storedUserName = localStorage.getItem('userName') || '';
    const storedRoleName = localStorage.getItem('role') || '';

    this.accountCodeSubject = new BehaviorSubject<string>(storedAccountCode);
    this.userNameSubject = new BehaviorSubject<string>(storedUserName);
    this.roleNameSubject = new BehaviorSubject<string>(storedRoleName);
  }
  
  setUserName(userNameValue: string): void {
    
    localStorage.setItem('userName', userNameValue);
    this.userNameSubject.next(userNameValue);
  }

  getUserName(){
    return this.userNameSubject.asObservable();
  }

  setAccountCode(accountCodeValue: string): void {
    console.log('Setting accountCode:', accountCodeValue);
    localStorage.setItem('accountCode', accountCodeValue);
    this.accountCodeSubject.next(accountCodeValue);
  }

  getAccountCode() {
    return this.accountCodeSubject.asObservable();
  }

  setRoleName(roleNameValue: string): void {
    localStorage.setItem('role', roleNameValue);
    this.roleNameSubject.next(roleNameValue);
  }

  getRoleName() {
    return this.roleNameSubject.asObservable();
  }

  getUser(userId: number): Observable<any> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }
}
