import { Component, Input } from '@angular/core';
import { MovieService } from '../services/movies.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-ratemovie',
  standalone: false,
  templateUrl: './ratemovie.component.html',
  styleUrl: './ratemovie.component.css'
})
export class RatemovieComponent {
  //means movieId cant be null will be assigned
  movieId!: number;
  rating: number = 0;
  message: string = '';

  //constructor
  constructor(private route: ActivatedRoute,private movieService: MovieService,private router: Router) {}

  ngOnInit(): void {
    //get movie id from route
    this.movieId = +this.route.snapshot.paramMap.get('id')!;
  }
  
  submitRating(): void {
    //rate movie api
    this.movieService.rateMovie(this.movieId, this.rating).subscribe(
      response => {
        //submit and navigate to details
        this.message = response.message || 'Rating submitted successfully';
        this.router.navigate(['/details', this.movieId]);
      },
      error => {
        this.message = error.error.message || 'An error occurred while submitting the rating';
      }
    );
  }
}  