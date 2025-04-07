import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      signup: jasmine.createSpy()
    };
    mockRouter = {
      navigate: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SignupComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form as invalid if required fields are missing', () => {
    component.signupForm.setValue({
      username: '',
      email: '',
      fullName: '',
      phoneNumber: '',
      address: '',
      password: '',
      confirmPassword: ''
    });
    expect(component.signupForm.invalid).toBeTrue();
  });

  it('should show error message if passwords do not match', () => {
    component.signupForm.setValue({
      username: 'test',
      email: 'test@example.com',
      fullName: 'Test User',
      phoneNumber: '1234567890',
      address: '123 Test St',
      password: 'password123',
      confirmPassword: 'password456'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Passwords do not match');
  });

  it('should call signup and navigate on successful signup', () => {
    component.signupForm.setValue({
      username: 'test',
      email: 'test@example.com',
      fullName: 'Test User',
      phoneNumber: '1234567890',
      address: '123 Test St',
      password: 'password123',
      confirmPassword: 'password123'
    });

    mockAuthService.signup.and.returnValue(of({ message: 'Success' }));

    component.onSubmit();

    expect(mockAuthService.signup).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show error on signup failure', () => {
    component.signupForm.setValue({
      username: 'test',
      email: 'test@example.com',
      fullName: 'Test User',
      phoneNumber: '1234567890',
      address: '123 Test St',
      password: 'password123',
      confirmPassword: 'password123'
    });

    mockAuthService.signup.and.returnValue(
      throwError(() => ({ error: { message: 'Signup failed' } }))
    );

    component.onSubmit();

    expect(component.errorMessage).toBe('Signup failed');
  });
});
