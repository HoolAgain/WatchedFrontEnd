import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  goHome(): void {
    this.router.navigate(['/']);
  }

  getPosts(movieId: number) {
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        const postsArray = data && data.$values ? data.$values : data;
        this.posts = postsArray.filter((post: any) => post.movieId === movieId);
        this.posts.forEach((post: any) => {
          if (post.liked === undefined) {
            post.liked = false;
          }
        });
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

  // Toggle accordion expansion and load comments
  togglePost(post: any) {
    post.expanded = !post.expanded;
    if (post.expanded && !post.comments) {
      this.loadComments(post);
    }
  }

  loadComments(post: any): void {
    this.commentService.getCommentsForPost(post.postId).subscribe({
      next: (data) => {
        // DATA IS WRAPPED { $id: "...", $values: [...] }, use $values; otherwise, use data.
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

  toggleLike(post: any): void {
    if (post.hasLiked) {
      // Unlike the post.
      this.postService.unlikePost(post.postId).subscribe({
        next: (response) => {
          // Update the local post object.
          post.hasLiked = false;
          post.likeCount = Math.max((post.likeCount || 1) - 1, 0);
          alert("Like removed!");
        },
        error: (error) => {
          console.error('Error unliking post:', error);
          alert(error.error?.message || "Error unliking post.");
        }
      });
    } else {
      // Like the post.
      const currentUserId = +localStorage.getItem('userId')!;
      // Prevent liking your own post.
      if (post.userId === currentUserId) {
        alert("You cannot like your own post.");
        return;
      }
      this.postService.likePost(post.postId).subscribe({
        next: (likeResponse) => {
          // Update the local post object.
          post.hasLiked = true;
          post.likeCount = (post.likeCount || 0) + 1;
          alert("Post liked!");
        },
        error: (error) => {
          console.error('Error liking post:', error);
          alert(error.error?.message || "Error liking post.");
        }
      });
    }
  }


  showCommentForm(post: any): void {
    post.showCommentForm = true;
    post.expanded = true;
    // Needs to wait a tick for Angular to update the view
    setTimeout(() => {
      const input = document.getElementById(`comment-input-${post.postId}`) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }


  isAdmin(): boolean {
    return localStorage.getItem('userClass') === 'admin';
  }


  isOwner(post: any): boolean {
    const userId = +localStorage.getItem('userId')!;
    return post.userId === userId;
  }


  isCommentOwner(comment: any): boolean {
    const userId = +localStorage.getItem('userId')!;
    return comment.userId === userId;
  }

  // POST HELPERS
  // Called when an admin clicks "Edit" on a post.
  enablePostEdit(post: any): void {
    post.editMode = true;
    post.editContent = post.content; // Pre-fill with the current content.
  }

  cancelPostEdit(post: any): void {
    post.editMode = false;
  }

  submitPostEdit(post: any): void {
    const updateRequest = {
      title: post.title, // Optionally allow title edits too.
      content: post.editContent
    };

    this.postService.updatePost(post.postId, updateRequest).subscribe({
      next: (updatedPost) => {
        post.content = updatedPost.content; // This should now include the appended admin signature.
        post.editMode = false;
      },
      error: (err) => {
        console.error("Error updating post", err);
      }
    });
  }

  // Delete a post (for admin or owner)
  deletePost(post: any): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(post.postId).subscribe({
        next: (response) => {
          alert('Post deleted successfully.');
          // Remove the deleted post from the posts array.
          this.posts = this.posts.filter(p => p.postId !== post.postId);
        },
        error: (err) => {
          console.error('Error deleting post:', err);
        }
      });
    }
  }

  // COMMENT HELPERS
  enableCommentEdit(comment: any): void {
    comment.editMode = true;
    comment.editContent = comment.content; // Pre-fill with current content.
  }


  cancelCommentEdit(comment: any): void {
    comment.editMode = false;
  }

  submitCommentEdit(comment: any, post: any): void {
    const updateData = { content: comment.editContent };
    this.commentService.updateComment(comment.commentId, updateData).subscribe({
      next: (updatedComment) => {
        comment.content = updatedComment.content; // Updated content (should include signature if admin)
        comment.editMode = false;
      },
      error: (error) => {
        console.error('Error updating comment', error);
      }
    });
  }

  // Delete a comment (for admin or owner)
  // We pass the parent post to update its local comments array.
  deleteComment(comment: any, post: any): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(comment.commentId).subscribe({
        next: (response) => {
          alert('Comment deleted successfully.');
          // Remove the comment from the post's comments array.
          post.comments = post.comments.filter((c: any) => c.commentId !== comment.commentId);
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
        }
      });
    }
  }


}
