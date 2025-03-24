import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateCommentRequest {
    postId: number;
    content: string;
}

@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private apiUrl = 'http://localhost:5238/api/comments';

    constructor(private http: HttpClient) { }

    createComment(request: CreateCommentRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, request);
    }

    getCommentsForPost(postId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/post/${postId}`);
    }
}
