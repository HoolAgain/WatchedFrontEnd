import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomepageComponent } from './homepage.component';
import { MovieService } from '../services/movies.service';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;
  let movieServiceSpy: jasmine.SpyObj<MovieService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    movieServiceSpy = jasmine.createSpyObj('MovieService', ['getMovies', 'fetchMovies']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule],
      declarations: [HomepageComponent],
      providers: [
        { provide: MovieService, useValue: movieServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
  });

  it('should create the homepage component', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoggedIn true if token exists', () => {
    authServiceSpy.getToken.and.returnValue('validToken');
    movieServiceSpy.getMovies.and.returnValue(of({ $values: [] }));
    fixture.detectChanges();

    expect(component.isLoggedIn).toBeTrue();
  });

  it('should set isLoggedIn false if no token', () => {
    authServiceSpy.getToken.and.returnValue(null);
    movieServiceSpy.getMovies.and.returnValue(of({ $values: [] }));
    fixture.detectChanges();

    expect(component.isLoggedIn).toBeFalse();
  });

  it('should fetch and display movies', () => {
    const mockMovies = {
      $values: [
        { movieId: 1, title: 'Movie 1', year: 2022, genre: 'Action', director: 'Dir 1', averageRating: 8, posterUrl: 'url1' }
      ]
    };

    authServiceSpy.getToken.and.returnValue('token');
    movieServiceSpy.getMovies.and.returnValue(of(mockMovies));

    fixture.detectChanges();

    const movieTitles = fixture.debugElement.queryAll(By.css('.movie-card h3'));
    expect(movieTitles.length).toBe(1);
    expect(movieTitles[0].nativeElement.textContent).toContain('Movie 1');
  });

  it('should call fetchMovies if no movies returned', () => {
    authServiceSpy.getToken.and.returnValue('token');
    movieServiceSpy.getMovies.and.returnValue(of({ $values: [] }));
    movieServiceSpy.fetchMovies.and.returnValue(of([]));

    fixture.detectChanges();

    expect(movieServiceSpy.fetchMovies).toHaveBeenCalled();
  });

  it('should log error if getMovies fails', () => {
    spyOn(console, 'error');
    authServiceSpy.getToken.and.returnValue('token');
    movieServiceSpy.getMovies.and.returnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith('Error fetching movies:', jasmine.any(Error));
  });

  it('should call logout and update isLoggedIn', () => {
    component.isLoggedIn = true;

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(component.isLoggedIn).toBeFalse();
  });
});
