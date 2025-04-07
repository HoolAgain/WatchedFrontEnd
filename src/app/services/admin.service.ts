import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://localhost:5238/api/admin';

    constructor(private http: HttpClient) { }

    getAdminLogs(): Observable<any> {
        return this.http.get(`${this.apiUrl}/logs`);
    }
}
