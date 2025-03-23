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

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    //get the movie id for the clicked one
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.getMovie(id);
  }

  getMovie(id: number) {
    //call the api
    this.movieService.getMovieById(id).subscribe(data => {
      this.movie = data;
    });
  }
}

