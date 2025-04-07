import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MoviedetailsComponent } from './moviedetails.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MovieService } from '../services/movies.service';
import { PostService } from '../services/post.service';
import { CommentService } from '../services/comment.service';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MoviedetailsComponent', () => {
  let component: MoviedetailsComponent;
  let fixture: ComponentFixture<MoviedetailsComponent>;
  let mockMovieService: any;
  let mockPostService: any;
  let mockCommentService: any;
  let mockRouter: any;
  

  beforeEach(async () => {
    mockMovieService = {
      getMovieById: jasmine.createSpy().and.returnValue(of({ movieId: 1, title: 'Test Movie' }))
    };
    mockPostService = {
      getAllPosts: jasmine.createSpy().and.returnValue(of({ $values: [] })),
      createPost: jasmine.createSpy().and.returnValue(of({})),
      updatePost: jasmine.createSpy().and.returnValue(of({ content: 'Updated Content' })),
      deletePost: jasmine.createSpy().and.returnValue(of({})),
      likePost: jasmine.createSpy().and.returnValue(of({})),
      unlikePost: jasmine.createSpy().and.returnValue(of({}))
    };
    mockCommentService = {
      getCommentsForPost: jasmine.createSpy().and.returnValue(of({ $values: [] })),
      createComment: jasmine.createSpy().and.returnValue(of({ content: 'New Comment' })),
      updateComment: jasmine.createSpy().and.returnValue(of({ content: 'Updated Comment' })),
      deleteComment: jasmine.createSpy().and.returnValue(of({}))
    };
    mockRouter = { navigate: jasmine.createSpy() };

    await TestBed.configureTestingModule({
      declarations: [MoviedetailsComponent],
      imports: [FormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: Router, useValue: mockRouter },
        { provide: MovieService, useValue: mockMovieService },
        { provide: PostService, useValue: mockPostService },
        { provide: CommentService, useValue: mockCommentService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MoviedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Reset all spies to avoid 'already spied upon' issues
    (mockPostService.getAllPosts as jasmine.Spy).calls.reset();
    (mockPostService.createPost as jasmine.Spy).calls.reset();
    (mockPostService.updatePost as jasmine.Spy).calls.reset();
    (mockPostService.deletePost as jasmine.Spy).calls.reset();
    (mockPostService.likePost as jasmine.Spy).calls.reset();
    (mockPostService.unlikePost as jasmine.Spy).calls.reset();
    (mockCommentService.getCommentsForPost as jasmine.Spy).calls.reset();
    (mockCommentService.createComment as jasmine.Spy).calls.reset();
    (mockCommentService.updateComment as jasmine.Spy).calls.reset();
    (mockCommentService.deleteComment as jasmine.Spy).calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getMovieById and getPosts on init', () => {
    expect(mockMovieService.getMovieById).toHaveBeenCalled();
    expect(mockPostService.getAllPosts).toHaveBeenCalled();
  });

  it('should navigate home on goHome()', () => {
    component.goHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should call createPost and reset form on success', () => {
    component.movie = { movieId: 1 };
    component.newPostTitle = 'Title';
    component.newPostContent = 'Content';
    component.createPost();
    expect(mockPostService.createPost).toHaveBeenCalled();
    expect(component.newPostTitle).toBe('');
    expect(component.newPostContent).toBe('');
  });

  it('should handle error in createPost()', () => {
    mockPostService.createPost.and.returnValue(throwError(() => ({ error: { message: 'Fail' } })));
    component.movie = { movieId: 1 };
    component.newPostTitle = 'Title';
    component.newPostContent = 'Content';
    component.createPost();
    expect(mockPostService.createPost).toHaveBeenCalled();
  });

  it('should toggle post and load comments', () => {
    const post = { postId: 1, expanded: false };
    component.togglePost(post);
    expect(post.expanded).toBeTrue();
    expect(mockCommentService.getCommentsForPost).toHaveBeenCalledWith(1);
  });

  it('should add comment to post', () => {
    const post = { postId: 1, newCommentContent: 'Nice!', comments: [] };
    component.addComment(post);
    expect(mockCommentService.createComment).toHaveBeenCalled();
    expect(post.comments.length).toBe(1);
    expect(post.newCommentContent).toBe('');
  });

  it('should like and unlike post', () => {
    spyOn(localStorage, 'getItem').and.returnValue('2');
    const post = { postId: 1, hasLiked: false, likeCount: 0, userId: 1 };
    component.toggleLike(post);
    expect(mockPostService.likePost).toHaveBeenCalled();

    post.hasLiked = true;
    component.toggleLike(post);
    expect(mockPostService.unlikePost).toHaveBeenCalled();
  });

  it('should edit and cancel post', () => {
    const post = { content: 'Old', editMode: false };
    component.enablePostEdit(post);
    expect(post.editMode).toBeTrue();
    component.cancelPostEdit(post);
    expect(post.editMode).toBeFalse();
  });

  it('should submit post edit', () => {
    const post = { postId: 1, title: 'Title', editContent: 'Edit Content' };
    component.submitPostEdit(post);
    expect(mockPostService.updatePost).toHaveBeenCalled();
  });

  it('should delete post', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const post = { postId: 1 };
    component.posts = [post];
    component.deletePost(post);
    expect(mockPostService.deletePost).toHaveBeenCalledWith(1);
  });

  it('should edit and cancel comment', () => {
    const comment = { content: 'Original', editMode: false };
    component.enableCommentEdit(comment);
    expect(comment.editMode).toBeTrue();
    component.cancelCommentEdit(comment);
    expect(comment.editMode).toBeFalse();
  });

  it('should submit comment edit', () => {
    const comment = { commentId: 1, editContent: 'Updated' };
    const post = {};
    component.submitCommentEdit(comment, post);
    expect(mockCommentService.updateComment).toHaveBeenCalled();
  });

  it('should delete comment', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const comment = { commentId: 1 };
    const post = { comments: [comment] };
    component.deleteComment(comment, post);
    expect(mockCommentService.deleteComment).toHaveBeenCalledWith(1);
  });
  it('should toggle post and not reload comments if already loaded', () => {
    const post = { expanded: false, comments: [{ content: 'Test' }] };
    component.togglePost(post);
    expect(post.expanded).toBeTrue();
    // comments should stay the same
    expect(post.comments.length).toBe(1);
  });
  it('should not add comment if commentText is empty', () => {
    const post = { postId: 1, newCommentContent: '' };
    spyOn(window, 'alert');
    component.addComment(post);
    expect(window.alert).toHaveBeenCalledWith('Please enter a comment.');
  });
  it('should return true for isAdmin if userClass is admin', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => key === 'userClass' ? 'admin' : null);
    expect(component.isAdmin()).toBeTrue();
  });
  it('should return true if user is post owner', () => {
    spyOn(localStorage, 'getItem').and.returnValue('1');
    expect(component.isOwner({ userId: 1 })).toBeTrue();
  });
  it('should expand post and set focus to input', (done) => {
    const post: any = { postId: 123 };
    spyOn(document, 'getElementById').and.returnValue({
      focus: jasmine.createSpy('focus')
    } as any);
  
    component.showCommentForm(post);
  
    setTimeout(() => {
      expect(post.showCommentForm).toBeTrue();
      expect(post.expanded).toBeTrue();
      expect(document.getElementById).toHaveBeenCalledWith('comment-input-123');
      done();
    }, 0);
  });
  
  it('should disable post edit mode', () => {
    const post = { editMode: true };
    component.cancelPostEdit(post);
    expect(post.editMode).toBeFalse();
  });
  
  it('should disable comment edit mode', () => {
    const comment = { editMode: true };
    component.cancelCommentEdit(comment);
    expect(comment.editMode).toBeFalse();
  });
  it('should enable post edit mode and set content', () => {
    const post: any = { content: 'abc' };
    component.enablePostEdit(post);
    expect(post.editMode).toBeTrue();
    expect(post.editContent).toBe('abc');
  });
  it('should enable comment edit mode and set content', () => {
    const comment: any = { content: 'xyz' };
    component.enableCommentEdit(comment);
    expect(comment.editMode).toBeTrue();
    expect(comment.editContent).toBe('xyz');
  });
  it('should handle error with message when creating post', () => {
    const postData = {
      movieId: 1,
      title: 'Test Title',
      content: 'Test Content'
    };
  
    component.movie = { movieId: 1 };
    component.newPostTitle = postData.title;
    component.newPostContent = postData.content;
  
    const errorMessage = 'Custom error msg';
  
    // Update existing spy instead of re-spying
    (mockPostService.createPost as jasmine.Spy).and.returnValue(
      throwError(() => ({ error: { message: errorMessage } }))
    );
  
    spyOn(window, 'alert');
  
    component.createPost();
  
    expect(mockPostService.createPost).toHaveBeenCalledWith(postData);
    expect(window.alert).toHaveBeenCalledWith(errorMessage);
  });
  
  it('should unwrap and add comment from $values', () => {
    const post = {
      postId: 1,
      newCommentContent: 'Hello',
      comments: { $values: [] }
    };
  
    const newComment = { content: 'Hello', commentId: 2 };
  
    // Update existing spy instead of re-spying
    (mockCommentService.createComment as jasmine.Spy).and.returnValue(of(newComment));
  
    component.addComment(post);
  
    expect(post.comments).toContain(newComment);
    expect(post.newCommentContent).toBe('');
  });
  
  
  it('should not like own post', () => {
    const post = { postId: 1, userId: 100 };
    localStorage.setItem('userId', '100');
    spyOn(window, 'alert');
  
    component.toggleLike(post);
    expect(window.alert).toHaveBeenCalledWith("You cannot like your own post.");
  });
  it('should handle error when fetching posts', () => {
    (mockPostService.getAllPosts as jasmine.Spy).and.returnValue(throwError(() => new Error('Fetch fail')));
    component.getPosts(1);
    expect(component.posts.length).toBe(0); // still safe
  });
  
 it('should handle generic error when creating post', () => {
  const postData = {
    movieId: 1,
    title: 'Test Title',
    content: 'Test Content'
  };

  component.movie = { movieId: 1 };
  component.newPostTitle = postData.title;
  component.newPostContent = postData.content;

  const error = { error: {} };

  (mockPostService.createPost as jasmine.Spy).and.returnValue(throwError(() => error));

  spyOn(window, 'alert');

  component.createPost();

  expect(window.alert).toHaveBeenCalledWith('There was an error adding your post.');
});

it('should handle error when loading comments', () => {
  const post = { postId: 1 };

  (mockCommentService.getCommentsForPost as jasmine.Spy).and.returnValue(throwError(() => new Error('fail')));

  component.loadComments(post);
  // Just verify it doesn't crash
});

it('should handle error in post update', () => {
  const post = {
    postId: 1,
    title: 'test title',
    editContent: 'updated content',
    content: 'original content',
    editMode: true
  };

  (mockPostService.updatePost as jasmine.Spy).and.returnValue(throwError(() => new Error('fail')));
  component.submitPostEdit(post);
  expect(post.editMode).toBeTrue(); // still in edit mode due to failure
});

it('should handle error when deleting comment', () => {
  spyOn(window, 'confirm').and.returnValue(true);
  const comment = { commentId: 1 };
  const post = { comments: [comment] };

  (mockCommentService.deleteComment as jasmine.Spy).and.returnValue(throwError(() => new Error('fail')));
  component.deleteComment(comment, post);
  expect(post.comments.length).toBe(1); // comment still present
});


  it('should handle error in comment update', () => {
    const comment = {
      commentId: 1,
      editContent: 'Updated',
      content: 'Original',
      editMode: true
    };
  
    (mockCommentService.updateComment as jasmine.Spy).and.returnValue(throwError(() => new Error('fail')));
  
    component.submitCommentEdit(comment, {});
    expect(comment.editMode).toBeTrue();
  });
  
  
  it('should handle error when deleting comment', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const comment = { commentId: 1 };
    const post = { comments: [comment] };
  
    (mockCommentService.deleteComment as jasmine.Spy).and.returnValue(throwError(() => new Error('fail')));
  
    component.deleteComment(comment, post);
    expect(post.comments.length).toBe(1); // still in the list
  });
  it('should default liked to false when it is undefined', () => {
    const fakePosts = [
      { movieId: 1, title: 'A' }, // no `liked` key
      { movieId: 1, title: 'B', liked: true } // has `liked`
    ];
  
    (mockPostService.getAllPosts as jasmine.Spy).and.returnValue(of({ $values: fakePosts }));
    
    component.getPosts(1);
  
    expect(component.posts.length).toBe(2);
    expect(component.posts[0].liked).toBeFalse(); // defaulted
    expect(component.posts[1].liked).toBeTrue();  // preserved
  });
  it('should log error when addComment fails', () => {
    const post = {
      postId: 1,
      newCommentContent: 'Test',
      comments: []
    };
  
    spyOn(console, 'error');
    (mockCommentService.createComment as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Add comment failed'))
    );
  
    component.addComment(post);
  
    expect(console.error).toHaveBeenCalledWith('Error adding comment:', jasmine.any(Error));
  });
  it('should log error if likePost fails', () => {
    const post = { postId: 1, hasLiked: false, likeCount: 0, userId: 2 };
    spyOn(localStorage, 'getItem').and.returnValue('3');
    spyOn(console, 'error');
  
    (mockPostService.likePost as jasmine.Spy).and.returnValue(
      throwError(() => ({ error: { message: 'Failed to like' } }))
    );
  
    component.toggleLike(post);
  
    expect(console.error).toHaveBeenCalledWith('Error liking post:', jasmine.any(Object));
  });
  it('should log error if unlikePost fails', () => {
    const post = { postId: 1, hasLiked: true, likeCount: 1 };
    spyOn(console, 'error');
  
    (mockPostService.unlikePost as jasmine.Spy).and.returnValue(
      throwError(() => ({ error: { message: 'Failed to unlike' } }))
    );
  
    component.toggleLike(post);
  
    expect(console.error).toHaveBeenCalledWith('Error unliking post:', jasmine.any(Object));
  });
  it('should log error when deletePost fails', () => {
    spyOn(window, 'confirm').and.returnValue(true); // simulate clicking "OK"
    const post = { postId: 1 };
    component.posts = [post];
  
    (mockPostService.deletePost as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Delete failed'))
    );
    spyOn(console, 'error');
  
    component.deletePost(post);
  
    expect(console.error).toHaveBeenCalledWith('Error deleting post:', jasmine.any(Error));
  });
  it('should return true if user is comment owner', () => {
    spyOn(localStorage, 'getItem').and.returnValue('5');
    const comment = { userId: 5 };
    expect(component.isCommentOwner(comment)).toBeTrue();
  });
  
  it('should return false if user is not comment owner', () => {
    spyOn(localStorage, 'getItem').and.returnValue('3');
    const comment = { userId: 5 };
    expect(component.isCommentOwner(comment)).toBeFalse();
  });
    
                
});

