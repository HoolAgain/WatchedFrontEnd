import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = 'http://localhost:5238/api/AI';

    constructor(private http: HttpClient) { }

    promptAI(prompt: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/chat`, { prompt });
      }
      
   
}
