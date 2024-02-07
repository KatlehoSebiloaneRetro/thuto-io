import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginSplashComponent } from './login-splash/login-splash.component';
import { ALL_TAIGA_UI_MODULES } from 'src/app/all-taiga-ui-modules';
import { RegisterTypeComponent } from './register-type/register-type.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import {  RouterModule } from '@angular/router';
import { StudentSignInComponent } from './student-sign-in/student-sign-in.component';
import {TuiCarouselModule} from '@taiga-ui/kit';
import { ParentRegistrationComponent } from './parent-registration/parent-registration.component';

@NgModule({
  declarations: [
    LoginSplashComponent,
    RegisterTypeComponent,
    StudentSignInComponent,
    ParentRegistrationComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    ALL_TAIGA_UI_MODULES,
    RouterModule
  ],
  exports:[LoginSplashComponent]
})
export class LoginModule { }
