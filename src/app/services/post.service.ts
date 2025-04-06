import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreatePostRequest {
    movieId: number;
    title: string;
    content: string;
}

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private apiUrl = 'http://localhost:5238/api/posts';

    constructor(private http: HttpClient) { }

    createPost(postData: CreatePostRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, postData);
    }

    getAllPosts(): Observable<any> {
        return this.http.get(`${this.apiUrl}/all`);
    }

    likePost(postId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${postId}/like`, {});
    }

    unlikePost(postId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${postId}/like`);
    }

}
