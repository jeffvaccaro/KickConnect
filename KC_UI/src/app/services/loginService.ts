import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:3000/login/user-login'; // Update with your API URL

  constructor(private http: HttpClient) { }
  
  public login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password });
  }
  
}
