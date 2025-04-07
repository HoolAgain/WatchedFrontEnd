import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { HttpClientModule } from '@angular/common/http';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MoviedetailsComponent } from './moviedetails/moviedetails.component';
import { RatemovieComponent } from './ratemovie/ratemovie.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { AdminReportsComponent } from './admin/admin-reports/admin-reports.component';


@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    SignupComponent,
    LoginComponent,
    MoviedetailsComponent,
    RatemovieComponent,
    ChatbotComponent,
    AdminReportsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
