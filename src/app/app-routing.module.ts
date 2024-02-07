import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './web/home/home.component';
import { ThutorComponent } from './web/thutor/thutor.component';
import { LoginSplashComponent } from './platform/login/login-splash/login-splash.component';
import { RegisterTypeComponent } from './platform/login/register-type/register-type.component';
import { StudentSignInComponent } from './platform/login/student-sign-in/student-sign-in.component';
import { DashContainerComponent } from './platform/dashboard/dash-container/dash-container.component';
import { ProgramContainerComponent } from './platform/dashboard/program-container/program-container.component';
import { RewardsContainerComponent } from './platform/dashboard/rewards-container/rewards-container.component';
import { SaveScreenComponent } from './platform/dashboard/save-screen/save-screen.component';
import { ParentRegistrationComponent } from './platform/login/parent-registration/parent-registration.component';
import { RedeemScreenComponent } from './platform/dashboard/redeem-screen/redeem-screen.component';
import { TopUpPageComponent } from './platform/dashboard/top-up-page/top-up-page.component';
import { DetailsComponentComponent } from './platform/dashboard/details-component/details-component.component';
import { PersonalReportComponent } from './platform/dashboard/personal-report/personal-report.component';

const routes: Routes = [
  { path: '',component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'thutor', component: ThutorComponent },
  { path: 'login', component: LoginSplashComponent },
  { path: 'register-type', component: RegisterTypeComponent },
  { path: 'sign-in', component: StudentSignInComponent },
  { path: 'dash', component: DashContainerComponent },
  { path: 'program', component: ProgramContainerComponent },
  { path: 'transactions', component: RewardsContainerComponent },
  { path: 'savings', component: SaveScreenComponent },
  { path: 'register', component: ParentRegistrationComponent },
  { path: 'redeem', component: RedeemScreenComponent},
  { path: 'top-up', component: TopUpPageComponent},
  { path: 'details', component: DetailsComponentComponent},
  { path: 'personal', component: PersonalReportComponent}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
