import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';


@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  constructor(private logger: NGXLogger, private http: HttpClient) {}

  logError(message: string, error: any) {
    this.logger.error(message, error);

    // Optionally, send logs to your backend
    this.http.post('/api/logger', { message, error }).subscribe();
  }
}
