import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'guestLogin']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.value).toEqual({ username: '', password: '' });
  });

  it('should show error message if form is invalid and submitted', () => {
    component.loginForm.controls['username'].setValue('');
    component.loginForm.controls['password'].setValue('');
    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call authService.login on valid form submission', () => {
    component.loginForm.controls['username'].setValue('testuser');
    component.loginForm.controls['password'].setValue('password');

    const mockResponse = { token: 'abc123', refreshToken: 'ref123' };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'testuser',
      passwordHash: 'password'
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set error message on login failure', () => {
    const errorResponse = {
      error: { message: 'Invalid credentials' }
    };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.controls['username'].setValue('user');
    component.loginForm.controls['password'].setValue('wrongpass');
    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should handle guest login success', () => {
    authServiceSpy.guestLogin.and.returnValue(of({ userId: 1, token: 'guest-token' }));

    component.guestLogin();

    expect(authServiceSpy.guestLogin).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle guest login failure', () => {
    authServiceSpy.guestLogin.and.returnValue(throwError(() => new Error('fail')));

    component.guestLogin();

    expect(component.errorMessage).toBe('Unable to login as guest.');
  });

  it('should navigate to home on goBack()', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
