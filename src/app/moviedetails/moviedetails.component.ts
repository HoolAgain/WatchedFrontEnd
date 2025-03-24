import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../services/movies.service';
import { PostService, CreatePostRequest } from '../services/post.service';
import { CommentService, CreateCommentRequest } from '../services/comment.service';

@Component({
  selector: 'app-moviedetails',
  templateUrl: './moviedetails.component.html',
  styleUrls: ['./moviedetails.component.css'],
  standalone: false
})
export class MoviedetailsComponent implements OnInit {
  movie: any;
  posts: any[] = [];
  newPostTitle: string = '';
  newPostContent: string = '';

  // Inject CommentService along with others.
  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private postService: PostService,
    private commentService: CommentService
  ) { }

  ngOnInit(): void {
    const movieIdStr = this.route.snapshot.paramMap.get('id');
    if (movieIdStr) {
      const movieId = +movieIdStr;
      this.movieService.getMovieById(movieId).subscribe((movie) => {
        this.movie = movie;
        this.getPosts(movieId);
      });
    }
  }

  getPosts(movieId: number) {
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        // With Newtonsoft and our DTO projection, data is wrapped?
        // If still wrapped:
        const postsArray = data && data.$values ? data.$values : data;
        // Filter posts by movieId (adjust property name if needed)
        this.posts = postsArray.filter((post: any) => post.movieId === movieId);
        console.log('Filtered posts for movieId', movieId, ':', this.posts);
      },
      error: (error) => {
        console.error('Error retrieving posts:', error);
      }
    });
  }

  createPost() {
    const postData: CreatePostRequest = {
      movieId: this.movie.movieId,
      title: this.newPostTitle,
      content: this.newPostContent
    };

    this.postService.createPost(postData).subscribe({
      next: (response) => {
        console.log('Post created successfully:', response);
        alert('Your post has been successfully added!');
        this.newPostTitle = '';
        this.newPostContent = '';
        this.getPosts(this.movie.movieId);
      },
      error: (error) => {
        console.error('Error creating post:', error);
        let errorMessage = 'There was an error adding your post.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        alert(errorMessage);
      }
    });
  }

  // Toggle accordion expansion and load comments if not already loaded.
  togglePost(post: any) {
    post.expanded = !post.expanded;
    if (post.expanded && !post.comments) {
      this.loadComments(post);
    }
  }

  loadComments(post: any): void {
    this.commentService.getCommentsForPost(post.postId).subscribe({
      next: (data) => {
        // If data is wrapped (e.g. { $id: "...", $values: [...] }), use $values; otherwise, use data.
        const commentsArray = data && data.$values ? data.$values : data;
        post.comments = commentsArray;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
      }
    });
  }


  addComment(post: any): void {
    const commentText = post.newCommentContent;
    if (!commentText) {
      alert('Please enter a comment.');
      return;
    }
    const request = { postId: post.postId, content: commentText } as CreateCommentRequest;
    this.commentService.createComment(request).subscribe({
      next: (newComment) => {
        alert('Comment added successfully!');
        // Ensure post.comments is an array:
        if (!post.comments) {
          post.comments = [];
        } else if (!Array.isArray(post.comments)) {
          post.comments = post.comments.$values || [];
        }
        post.comments.push(newComment);
        // Clear the temporary input.
        post.newCommentContent = '';
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        alert('Failed to add comment.');
      }
    });
  }



  //Not implemented
  likePost(post: any): void {
    // TODO: Implement liking functionality
    console.log('Liking post:', post);
  }

  showCommentForm(post: any): void {
    // Open the comment form (ensure it is visible)
    post.showCommentForm = true;
    // Optionally also expand the post details if needed:
    post.expanded = true;
    // Wait a tick for Angular to update the view, then focus the input.
    setTimeout(() => {
      const input = document.getElementById(`comment-input-${post.postId}`) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }
}
