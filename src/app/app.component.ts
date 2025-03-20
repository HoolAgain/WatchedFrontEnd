import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'WatchedFrontEnd';

  constructor(private authService: AuthService) {}

  //starts the refresh process if token is there
  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.authService.startTokenRefresh(); 
    }
  }
}

