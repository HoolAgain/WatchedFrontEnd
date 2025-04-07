import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MoviedetailsComponent } from './moviedetails.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MovieService } from '../services/movies.service';
import { PostService } from '../services/post.service';
import { CommentService } from '../services/comment.service';

describe('MoviedetailsComponent', () => {
  let component: MoviedetailsComponent;
  let fixture: ComponentFixture<MoviedetailsComponent>;

  let mockMovieService: jasmine.SpyObj<MovieService>;
  let mockPostService: jasmine.SpyObj<PostService>;
  let mockCommentService: jasmine.SpyObj<CommentService>;

  beforeEach(async () => {
    mockMovieService = jasmine.createSpyObj('MovieService', ['getMovieById']);
    mockPostService = jasmine.createSpyObj('PostService', ['getAllPosts', 'likePost', 'unlikePost', 'createPost']);
    mockCommentService = jasmine.createSpyObj('CommentService', ['getCommentsForPost', 'createComment']);

    await TestBed.configureTestingModule({
      declarations: [MoviedetailsComponent],
      imports: [RouterTestingModule, FormsModule, CommonModule, RouterModule],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: PostService, useValue: mockPostService },
        { provide: CommentService, useValue: mockCommentService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MoviedetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load movie and posts on init', () => {
    const movieMock = { movieId: 1, title: 'Test Movie' };
    const postsMock = { $values: [{ postId: 1, movieId: 1, title: 'Hello', content: 'test', username: 'bob' }] };

    mockMovieService.getMovieById.and.returnValue(of(movieMock));
    mockPostService.getAllPosts.and.returnValue(of(postsMock));

    fixture.detectChanges();

    expect(component.movie).toEqual(movieMock);
    expect(component.posts.length).toBe(1);
    expect(mockMovieService.getMovieById).toHaveBeenCalledWith(1);
    expect(mockPostService.getAllPosts).toHaveBeenCalled();
  });

  it('should create a post', () => {
    component.movie = { movieId: 1 };
    component.newPostTitle = 'Test Title';
    component.newPostContent = 'Test Content';

    mockPostService.createPost.and.returnValue(of({}));
    mockPostService.getAllPosts.and.returnValue(of({ $values: [] }));

    component.createPost();

    expect(mockPostService.createPost).toHaveBeenCalled();
  });

  it('should like a post', () => {
    spyOn(localStorage, 'getItem').and.returnValue('99');

    const post = { postId: 1, userId: 50, hasLiked: false, likeCount: 0 };

    mockPostService.likePost.and.returnValue(of({}));

    component.toggleLike(post);

    expect(post.hasLiked).toBeTrue();
    expect(post.likeCount).toBe(1);
  });

  it('should not allow liking your own post', () => {
    spyOn(localStorage, 'getItem').and.returnValue('1');
    const post = { postId: 1, userId: 1, hasLiked: false, likeCount: 0 };

    spyOn(window, 'alert');
    component.toggleLike(post);

    expect(window.alert).toHaveBeenCalledWith('You cannot like your own post.');
  });

  it('should unlike a post', () => {
    const post = { postId: 1, hasLiked: true, likeCount: 1 };

    mockPostService.unlikePost.and.returnValue(of({}));

    component.toggleLike(post);

    expect(post.hasLiked).toBeFalse();
    expect(post.likeCount).toBe(0);
  });

  it('should add a comment', () => {
    const post = {
      postId: 1,
      newCommentContent: 'Nice movie!',
      comments: []
    };
  
    const comment = { content: 'Nice movie!', username: 'user1' };
    mockCommentService.createComment.and.returnValue(of(comment));
  
    component.addComment(post);
  
    expect(post.comments?.length).toBe(1);
    expect(post.comments[0]).toEqual(comment);
  });

  it('should load comments for a post', fakeAsync(() => {
    const post: any = { postId: 1 };
    const comments = { $values: [{ content: 'Hello', username: 'bob' }] };

    mockCommentService.getCommentsForPost.and.returnValue(of(comments));

    component.loadComments(post);
    tick();

    expect(post.comments.length).toBe(1);
  }));

  it('should show comment form and expand post', () => {
    const post: any = {
      postId: 1,
      showCommentForm: false,
      expanded: false
    };

    component.showCommentForm(post);

    expect(post.showCommentForm).toBeTrue();
    expect(post.expanded).toBeTrue();
  });
  
  it('should navigate to home when goHome is called', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
  
    component.goHome();
  
    expect(spy).toHaveBeenCalledWith(['/']);
  });
  it('should handle error when retrieving posts', () => {
    const consoleSpy = spyOn(console, 'error');
    mockPostService.getAllPosts.and.returnValue(throwError(() => new Error('Failed to fetch posts')));
  
    component.movie = { movieId: 1 };
    component.getPosts(1);
  
    expect(consoleSpy).toHaveBeenCalledWith('Error retrieving posts:', jasmine.any(Error));
  });
  it('should handle error when creating a post and show alert', () => {
    const errorResponse = { error: { message: 'Custom error message' } };
    mockPostService.createPost.and.returnValue(throwError(() => errorResponse));
    spyOn(window, 'alert');
  
    component.movie = { movieId: 1 };
    component.newPostTitle = 'title';
    component.newPostContent = 'content';
  
    component.createPost();
  
    expect(window.alert).toHaveBeenCalledWith('Custom error message');
  });
  it('should toggle post expansion and load comments if not already loaded', () => {
    const post = { postId: 1, expanded: false };
    const commentsMock = { $values: [{ content: 'Nice', username: 'x' }] };
  
    mockCommentService.getCommentsForPost.and.returnValue(of(commentsMock));
  
    component.togglePost(post);
  
    expect(post.expanded).toBeTrue();
  });
  it('should alert if trying to add empty comment', () => {
    const post = { postId: 1, newCommentContent: '' };
    spyOn(window, 'alert');
  
    component.addComment(post);
  
    expect(window.alert).toHaveBeenCalledWith('Please enter a comment.');
  });
  it('should handle error when adding a comment', () => {
    const post = { postId: 1, newCommentContent: 'Oops', comments: [] };
    spyOn(window, 'alert');
    spyOn(console, 'error');
    mockCommentService.createComment.and.returnValue(throwError(() => new Error('Failed to comment')));
  
    component.addComment(post);
  
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Failed to add comment.');
  });
          
});