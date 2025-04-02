import { Component } from '@angular/core';
import { ChatService } from '../services/chatbot.service';

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

  constructor(private chatService: ChatService) {}

  sendPrompt() {
    this.loading = true;
    
    this.chatService.promptAI(this.prompt).subscribe(res => {
      this.response = res.response;
      this.loading = false;
    });
  }
  
}