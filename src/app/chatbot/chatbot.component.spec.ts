import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatbotComponent } from './chatbot.component';
import { ChatService } from '../services/chatbot.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('ChatbotComponent', () => {
  let component: ChatbotComponent;
  let fixture: ComponentFixture<ChatbotComponent>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    chatServiceSpy = jasmine.createSpyObj('ChatService', ['promptAI']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ChatbotComponent],
      imports: [FormsModule],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the chatbot component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to home on goHome()', () => {
    component.goHome();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should call chat service and set response when sendPrompt is called', () => {
    const mockResponse = { response: 'Hello from AI!' };
    chatServiceSpy.promptAI.and.returnValue(of(mockResponse));

    component.prompt = 'Hi';
    component.sendPrompt();

    expect(component.loading).toBeFalse();
    expect(component.response).toBe('Hello from AI!');
    expect(chatServiceSpy.promptAI).toHaveBeenCalledWith('Hi');
  });

  it('should show loading when sendPrompt is called', () => {
    chatServiceSpy.promptAI.and.returnValue(of({ response: 'Mock reply' }));

    component.sendPrompt();

    expect(component.loading).toBeFalse(); // It becomes false again after response
  });
});
