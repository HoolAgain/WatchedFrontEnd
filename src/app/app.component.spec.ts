import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      getToken: jasmine.createSpy().and.returnValue(null),
      startTokenRefresh: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([])
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'WatchedFrontEnd'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('WatchedFrontEnd');
  });

  it('should call startTokenRefresh if token exists', () => {
    mockAuthService.getToken.and.returnValue('fake-token');

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(mockAuthService.startTokenRefresh).toHaveBeenCalled();
  });

  it('should not call startTokenRefresh if no token exists', () => {
    mockAuthService.getToken.and.returnValue(null);

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(mockAuthService.startTokenRefresh).not.toHaveBeenCalled();
  });
});
