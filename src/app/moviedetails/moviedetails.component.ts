import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movies.service';

@Component({
  selector: 'app-moviedetails',
  standalone: false,
  templateUrl: './moviedetails.component.html',
  styleUrl: './moviedetails.component.css'
})
export class MoviedetailsComponent {
  movie: any;

  //constructor
  constructor(private route: ActivatedRoute,private movieService: MovieService) {}

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
}
