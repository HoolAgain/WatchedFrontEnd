import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, Subscription } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //api url
  private apiUrl = 'http://localhost:5238/api/users';
  //used for reoccuring method after the time of 15min for the refresh token to work
  private refreshSubscription: Subscription | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  //signup auth link to backend
  signup(signupData: { username: string; email: string; passwordHash: string; fullName: string; phoneNumber: string; address: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, signupData);
  }
  

  //login auth to link backend
  login(loginData: { username: string; passwordHash: string }): Observable<any> {
    //pipe used to concat the username and password with the storedTokens and the refresh
    return this.http.post(`${this.apiUrl}/login`, loginData).pipe(
      //tap used to allow to store and modify data not in the observable
      tap((response: any) => {
        //store tokens
        this.storeTokens({ token: response.token, refreshToken: response.refreshToken, userClass: "member"});
        console.log("Login successful");
        //used to start token refresh
        this.startTokenRefresh();
      })
    );
  }

  startTokenRefresh() {
    //if refresh token exists, unsubscribe to restart this proccess
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    //means every 15min
    this.refreshSubscription = interval(15 * 60 * 1000)
      .subscribe(() => {
        //call the refresh
        this.refreshToken().subscribe({
          next: () => console.log('Token refreshed'),
          error: () => console.log(' Refresh failed')
        });
      });
  }
  
//refresh login
  refreshToken(): Observable<any> {
    //call get methods
    const refreshToken = this.getRefreshToken();
    const memberId = this.getUserId();

    //logout if these dont exist or are expired
    if (!refreshToken || !memberId) {
      this.logout();
      return new Observable(observer => {
        observer.error({ message: "No refresh token available" });
      });
    }

    //refresh url
    return this.http.post(`${this.apiUrl}/refresh`, { memberId, token: refreshToken }).pipe(
      tap((response: any) => {
        this.storeTokens({ token: response.token, refreshToken: response.refreshToken });
        console.log("Token refreshed successfully");
      }),
      catchError(() => {
        this.logout(); //logout if refresh fails
        return new Observable(observer => {
          observer.error({ message: "Session expired" });
        });
      })
    );
  }

  //set items
  storeTokens(tokens: any): void {
    console.log(Object.keys(tokens));
    Object.keys(tokens).forEach((key) => {
      localStorage.setItem(key, tokens[key])
    })
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId'); 
  }

  getUserClass(): string | null {
    return localStorage.getItem('userClass');
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userClass');
    
    console.log("Logged out successfully.");
    this.router.navigate(['/login']); 
  }
  
}