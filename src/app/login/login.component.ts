import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  //constructor for the auth service
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    //if invalid return
    if (this.loginForm.invalid) return;

    //pull form values and relate to db values
    const loginData = {
      username: this.loginForm.value.username,
      passwordHash: this.loginForm.value.password
    };

    //login
    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        //save jwt
        localStorage.setItem('token', response.token); 
        //save refresh token
        localStorage.setItem('refreshToken', response.refreshToken); 
        //redirect to home
        this.router.navigate(['/']); 
      },
      error: (error) => {
        //errors for handling
        console.error('Login failed', error);
        this.errorMessage = error.error?.message || "Invalid username or password";
      }
    });
  }

  guestLogin() {
    //call api
    this.authService.guestLogin().subscribe({
      next: (response) => {
        console.log('Guest login successful', response);
        //redirect home
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Guest login failed', error);
        this.errorMessage = "Unable to login as guest.";
      }
    });
  }
  
  
  goBack() {
    this.router.navigate(['/']); 
  }
}
