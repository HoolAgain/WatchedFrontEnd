import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movies.service';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements OnInit{
  //on initialize create movies array
  movies: any[] = [];

  //get movie service
  constructor(private movieService: MovieService) {}

  //on init get the movies
  ngOnInit(): void {
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

 
}