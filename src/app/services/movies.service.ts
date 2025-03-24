import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:5238/api/movies';

  constructor(private http: HttpClient) { }

  getMovies(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  fetchMovies(): Observable<any> {
    return this.http.post(`${this.apiUrl}/fetch`, {});
  }

  getMovieById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  rateMovie(movieId: number, rating: number): Observable<any> {
    //get the token and set it in the headers of the bearer token for validation
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/${movieId}/ratemovie`, { Rating: rating }, { headers });
  }
}
