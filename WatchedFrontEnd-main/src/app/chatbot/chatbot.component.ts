import { Component } from '@angular/core';
import { ChatService } from '../services/chatbot.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbot',
  standalone: false,
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  prompt: string = '';
  response: string = '';
  loading: boolean = false;

  constructor(private chatService: ChatService, private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  sendPrompt() {
    this.loading = true;
    
    this.chatService.promptAI(this.prompt).subscribe(res => {
      this.response = res.response;
      this.loading = false;
    });
  }
  
}