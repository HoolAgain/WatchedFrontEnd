import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatemovieComponent } from './ratemovie.component';
import { FormsModule } from '@angular/forms'; // ✅ ADD THIS
import { HttpClientTestingModule } from '@angular/common/http/testing'; // ✅ for HttpClient
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MovieService } from '../services/movies.service';

describe('RatemovieComponent', () => {
  let component: RatemovieComponent;
  let fixture: ComponentFixture<RatemovieComponent>;
  let movieServiceSpy: jasmine.SpyObj<MovieService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const movieServiceMock = jasmine.createSpyObj('MovieService', ['rateMovie']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [RatemovieComponent],
      imports: [FormsModule, HttpClientTestingModule], // ✅ FormsModule added
      providers: [
        { provide: MovieService, useValue: movieServiceMock },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '5' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RatemovieComponent);
    component = fixture.componentInstance;
    movieServiceSpy = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
    fixture.detectChanges();
  });

  it('should create the component and assign movieId from route', () => {
    expect(component).toBeTruthy();
    expect(component.movieId).toBe(5);
  });

  it('should show error for invalid rating < 1', () => {
    component.rating = 0;
    component.submitRating();
    expect(component.message).toBe('Please enter a number between 1 and 10.');
  });

  it('should show error for invalid rating > 10', () => {
    component.rating = 11;
    component.submitRating();
    expect(component.message).toBe('Please enter a number between 1 and 10.');
  });

  it('should call movieService and navigate on valid rating', () => {
    component.rating = 8;
    movieServiceSpy.rateMovie.and.returnValue(of({ message: 'Rated!' }));
    component.submitRating();

    expect(movieServiceSpy.rateMovie).toHaveBeenCalledWith(5, 8);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/details', 5]);
  });

  it('should handle errors from movieService', () => {
    component.rating = 7;
    movieServiceSpy.rateMovie.and.returnValue(
      throwError(() => ({
        error: { message: 'Backend error' }
      }))
    );

    component.submitRating();
    expect(component.message).toBe('Backend error');
  });
});