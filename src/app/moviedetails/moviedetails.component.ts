import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../services/movies.service';
import { PostService, CreatePostRequest } from '../services/post.service';

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

  //constructor
  constructor(private route: ActivatedRoute, private movieService: MovieService, private postService: PostService) { }

  ngOnInit(): void {
    //get movieId from route
    const movieId = this.route.snapshot.paramMap.get('id');

    if (movieId) {
      //get movie id
      this.movieService.getMovieById(+movieId).subscribe((movie) => {
        this.movie = movie;
      });
    }
  }


  getMovie(id: number) {
    //call api
    this.movieService.getMovieById(id).subscribe(data => {
      this.movie = data;
    });
  }

  getPosts(movieId: number) {
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        // If data is wrapped (e.g. { $id: "1", $values: [...] }), extract the array.
        const postsArray = data && data.$values ? data.$values : data;
        this.posts = postsArray.filter((post: any) => post.movieId === movieId);
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
        // Immediately update the posts list:
        this.posts.push(response);
        // Provide feedback to the user
        alert('Your post has been successfully added!');
        // Clear the form fields.
        this.newPostTitle = '';
        this.newPostContent = '';
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

  // Toggle the expanded state of a post for the accordion effect.
  togglePost(post: any) {
    post.expanded = !post.expanded;
  }

  // Stub: Handle like action for a post.
  likePost(post: any) {
    // Call your PostService.likePost method (or add similar logic) here.
    // For now, just log to the console.
    console.log('Liking post:', post);
    // You might also update the like count in the UI if successful.
  }

  // Stub: Show/hide the comment form.
  showCommentForm(post: any) {
    post.showCommentForm = !post.showCommentForm;
  }

}
