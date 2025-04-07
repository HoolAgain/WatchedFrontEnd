import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ChatService } from './chatbot.service';
import { CommentService } from './comment.service';
import { MovieService } from './movies.service';
import { PostService } from './post.service';
import { AdminService } from './admin.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('All Services Integration', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService, ChatService, CommentService, MovieService, PostService,  AdminService]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('AuthService: should send login request and store tokens', () => {
    const service = TestBed.inject(AuthService);
    const mockResponse = { token: 'abc123', refreshToken: 'refresh123' };

    service.login({ username: 'test', passwordHash: '123' }).subscribe(res => {
      expect(res.token).toEqual('abc123');
    });

    const req = httpMock.expectOne('http://localhost:5238/api/users/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('AuthService: should logout properly', () => {
    const service = TestBed.inject(AuthService);
    spyOn(localStorage, 'removeItem');
    service.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userId');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userClass');
  });

  it('AuthService: getToken should return null if not set', () => {
    const service = TestBed.inject(AuthService);
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(service.getToken()).toBeNull();
  });

  it('AuthService: should send guest login and store tokens', () => {
    const service = TestBed.inject(AuthService);
    const mockResponse = {
      token: 'guestToken',
      refreshToken: 'refreshGuest',
      userId: '999'
    };

    spyOn(service as any, 'storeTokens');
    spyOn(service as any, 'startTokenRefresh');

    service.guestLogin().subscribe(res => {
      expect(service['storeTokens']).toHaveBeenCalledWith({
        token: 'guestToken',
        refreshToken: 'refreshGuest',
        userId: '999',
        userClass: 'guest'
      });
      expect(service['startTokenRefresh']).toHaveBeenCalled();
    });

    const req = httpMock.expectOne('http://localhost:5238/api/users/guest');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('AuthService: should handle refreshToken() with no tokens', () => {
    const service = TestBed.inject(AuthService);
    spyOn(service, 'getRefreshToken').and.returnValue(null);
    spyOn(service, 'getUserId').and.returnValue(null);
    spyOn(service, 'logout');

    service.refreshToken().subscribe({
      error: (err) => {
        expect(err.message).toBe('No refresh token available');
        expect(service.logout).toHaveBeenCalled();
      }
    });
  });

  it('ChatService: should send prompt to AI and receive response', () => {
    const service = TestBed.inject(ChatService);
    const mockResponse = { response: 'Hello there!' };

    service.promptAI('Hi').subscribe(res => {
      expect(res.response).toBe('Hello there!');
    });

    const req = httpMock.expectOne('http://localhost:5238/api/AI/chat');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('CommentService: should send create comment request', () => {
    const service = TestBed.inject(CommentService);
    const comment = { postId: 1, content: 'Great post!' };

    service.createComment(comment).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:5238/api/comments/create');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('MovieService: should fetch movies', () => {
    const service = TestBed.inject(MovieService);

    service.getMovies().subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:5238/api/movies');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('PostService: should create post', () => {
    const service = TestBed.inject(PostService);
    const post = { movieId: 1, title: 'Test', content: 'This is a post' };

    service.createPost(post).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:5238/api/posts/create');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
  it('MovieService: should fetch movies from /fetch endpoint', () => {
    const service = TestBed.inject(MovieService);
  
    service.fetchMovies().subscribe(res => {
      expect(res).toBeTruthy();
    });
  
    const req = httpMock.expectOne('http://localhost:5238/api/movies/fetch');
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });
  
  it('MovieService: should get movie by ID', () => {
    const service = TestBed.inject(MovieService);
    const mockMovie = { movieId: 42, title: 'Test Movie' };
  
    service.getMovieById(42).subscribe(movie => {
      expect(movie.movieId).toBe(42);
      expect(movie.title).toBe('Test Movie');
    });
  
    const req = httpMock.expectOne('http://localhost:5238/api/movies/42');
    expect(req.request.method).toBe('GET');
    req.flush(mockMovie);
  });
  
  it('MovieService: should rate a movie with token in headers', () => {
    const service = TestBed.inject(MovieService);
    const token = 'testToken123';
  
    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'token') return token;
      return null;
    });
  
    const movieId = 1;
    const rating = 8;
  
    service.rateMovie(movieId, rating).subscribe(res => {
      expect(res).toBeTruthy();
    });
  
    const req = httpMock.expectOne(`http://localhost:5238/api/movies/${movieId}/ratemovie`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Rating: rating });
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
  
    req.flush({ message: 'Rating submitted' });
  });
  it('PostService: should get all posts', () => {
    const service = TestBed.inject(PostService);
    const mockPosts = [{ postId: 1, title: 'Test Post' }];
  
    service.getAllPosts().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].postId).toBe(1);
    });
  
    const req = httpMock.expectOne('http://localhost:5238/api/posts/all');
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
  });
  
  it('PostService: should like a post', () => {
    const service = TestBed.inject(PostService);
    const postId = 1;
  
    service.likePost(postId).subscribe(res => {
      expect(res).toBeTruthy();
    });
  
    const req = httpMock.expectOne(`http://localhost:5238/api/posts/${postId}/like`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ success: true });
  });
  
  it('PostService: should unlike a post', () => {
    const service = TestBed.inject(PostService);
    const postId = 1;
  
    service.unlikePost(postId).subscribe(res => {
      expect(res).toBeTruthy();
    });
  
    const req = httpMock.expectOne(`http://localhost:5238/api/posts/${postId}/like`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
  it('AuthService: should refresh token successfully', () => {
    const service = TestBed.inject(AuthService);
    const mockResponse = { token: 'newToken', refreshToken: 'newRefresh' };
  
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'refreshToken') return 'validRefreshToken';
      if (key === 'userId') return '99';
      return null;
    });
  
    service.refreshToken().subscribe(res => {
      expect(res).toBeTruthy();
    });
  
    const req = httpMock.expectOne('http://localhost:5238/api/users/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      memberId: '99',
      token: 'validRefreshToken'
    });
    req.flush(mockResponse);
  });
  
  it('AuthService: should fail to refresh if no token or userId', (done) => {
    const service = TestBed.inject(AuthService);
  
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(service, 'logout');
  
    service.refreshToken().subscribe({
      error: (err) => {
        expect(err.message).toBe('No refresh token available');
        expect(service.logout).toHaveBeenCalled();
        done();
      }
    });
  });
  
  it('AuthService: should logout if server returns refresh error', (done) => {
    const service = TestBed.inject(AuthService);
  
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'refreshToken') return 'someToken';
      if (key === 'userId') return '99';
      return null;
    });
  
    spyOn(service, 'logout');
  
    service.refreshToken().subscribe({
      error: (err) => {
        expect(err.message).toBe('Session expired');
        expect(service.logout).toHaveBeenCalled();
        done();
      }
    });
  
    const req = httpMock.expectOne('http://localhost:5238/api/users/refresh');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });
  
  it('AuthService: should return refresh token from storage', () => {
    localStorage.setItem('refreshToken', 'abc');
    const service = TestBed.inject(AuthService);
    expect(service.getRefreshToken()).toBe('abc');
  });
  
  it('AuthService: should return userId from storage', () => {
    localStorage.setItem('userId', '42');
    const service = TestBed.inject(AuthService);
    expect(service.getUserId()).toBe('42');
  });
  
  it('AuthService: should return userClass from storage', () => {
    localStorage.setItem('userClass', 'guest');
    const service = TestBed.inject(AuthService);
    expect(service.getUserClass()).toBe('guest');
  });
  it('AdminService: should fetch admin logs', () => {
    const service = TestBed.inject(AdminService);
    const mockLogs = [{ id: 1, action: 'LOGIN' }];
  
    service.getAdminLogs().subscribe(res => {
      expect(res).toEqual(mockLogs);
    });
  
    const req = httpMock.expectOne('http://localhost:5238/api/admin/logs');
    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);
  });
  
  it('AdminService: should fetch site activity with filter', () => {
    const service = TestBed.inject(AdminService);
    const mockActivity = [{ id: 1, action: 'POST_CREATED' }];
    const filter = 'posts';
  
    service.getSiteActivity(filter).subscribe(res => {
      expect(res).toEqual(mockActivity);
    });
  
    const req = httpMock.expectOne(
      r => r.url === 'http://localhost:5238/api/admin/site-activity' && r.params.get('filter') === 'posts'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockActivity);
  });
  it('CommentService: should fetch comments for a post', () => {
    const service = TestBed.inject(CommentService);
    const postId = 1;
    const mockComments = [{ commentId: 1, content: 'Nice post' }];
  
    service.getCommentsForPost(postId).subscribe(res => {
      expect(res).toEqual(mockComments);
    });
  
    const req = httpMock.expectOne(`http://localhost:5238/api/comments/post/${postId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockComments);
  });
  
  it('CommentService: should update a comment', () => {
    const service = TestBed.inject(CommentService);
    const commentId = 1;
    const updateData = { content: 'Updated content' };
    const mockResponse = { commentId: 1, content: 'Updated content' };
  
    service.updateComment(commentId, updateData).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`http://localhost:5238/api/comments/${commentId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockResponse);
  });
  
  it('CommentService: should delete a comment', () => {
    const service = TestBed.inject(CommentService);
    const commentId = 1;
  
    service.deleteComment(commentId).subscribe(res => {
      expect(res).toBeTruthy();
    });
  
    const req = httpMock.expectOne(`http://localhost:5238/api/comments/${commentId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
  it('PostService: should update a post', () => {
    const service = TestBed.inject(PostService);
    const postId = 1;
    const updateData = { content: 'Updated post content' };
    const mockResponse = { postId, content: 'Updated post content' };
  
    service.updatePost(postId, updateData).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`http://localhost:5238/api/posts/${postId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockResponse);
  });
  
  it('PostService: should delete a post', () => {
    const service = TestBed.inject(PostService);
    const postId = 1;
  
    service.deletePost(postId).subscribe(res => {
      expect(res).toBeTruthy();
    });
  
    const req = httpMock.expectOne(`http://localhost:5238/api/posts/${postId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
  
});