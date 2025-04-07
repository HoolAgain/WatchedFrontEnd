import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { MoviedetailsComponent } from './moviedetails/moviedetails.component';
import { RatemovieComponent } from './ratemovie/ratemovie.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { AdminReportsComponent } from './admin/admin-reports/admin-reports.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'details/:id', component: MoviedetailsComponent },
  { path: 'addrating/:id', component: RatemovieComponent },
  { path: 'chatbot', component: ChatbotComponent },
  { path: 'admin-reports', component: AdminReportsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
