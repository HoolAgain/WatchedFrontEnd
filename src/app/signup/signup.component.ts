import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  //constructor
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
      address: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
    
  }  

  onSubmit() {
    //return if invalid
    if (this.signupForm.invalid) return;

    //return if passwords dont match
    if (this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
      this.errorMessage = "Passwords do not match";
      return;
    }

    const signupData = {
      username: this.signupForm.value.username,
      email: this.signupForm.value.email,
      passwordHash: this.signupForm.value.password,
      fullName: this.signupForm.value.fullName, 
      phoneNumber: this.signupForm.value.phoneNumber, 
      address: this.signupForm.value.address
    };

    //signup
    this.authService.signup(signupData).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        //redirect to login
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Signup failed', error);
        this.errorMessage = error.error?.message || "Signup failed";
      }
    });
  }

  goBack() {
    this.router.navigate(['/']); 
  }
}
