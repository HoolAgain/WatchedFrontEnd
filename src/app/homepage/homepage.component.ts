import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movies.service';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements OnInit{
  //on initialize create movies array
  movies: any[] = [];
  //create a bool
  isLoggedIn = false; 

  //get services
  constructor(private movieService: MovieService,  private authService: AuthService) {}

  //on init get the movies, and 
  ngOnInit(): void {
    const token = this.authService.getToken();
    //check if theres a token
    if (token) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }    
    this.checkMovies();
  }

  //check if movies exist
  checkMovies(): void {
    //call get movies service
    this.movieService.getMovies().subscribe(
      (data: any) => {
        //extract json if not make array of errors
        this.movies = data?.$values || []; 

        //if no movies call fetchmovies
        if (this.movies.length === 0) {
          console.log('No movies found. Fetching from API');
          this.fetchMovies();
        }
      },
      (error) => {
        console.error('Error fetching movies:', error);
      }
    );
  }

  
  fetchMovies(): void {
    //fetch movies
    this.movieService.fetchMovies().subscribe(
      () => {
        console.log('Movies fetched successfully!');
        //get the movies after
        this.checkMovies();
      },
      (error) => {
        console.error('Error fetching movies:', error);
      }
    );
  }

  //logout function from auth service
  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false; 
  }
}