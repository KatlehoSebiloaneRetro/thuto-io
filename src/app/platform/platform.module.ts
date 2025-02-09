import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModule } from './login/login.module';
import { ALL_TAIGA_UI_MODULES } from '../all-taiga-ui-modules';
import {  RouterModule } from '@angular/router';
import { DashboardModule } from './dashboard/dashboard.module';
import { AssessmentDialogComponent } from './assessment-dialog/assessment-dialog/assessment-dialog.component';

@NgModule({
  declarations: [
  
    AssessmentDialogComponent
  ],
  imports: [
    CommonModule,
    ALL_TAIGA_UI_MODULES,
    RouterModule
  ],
  exports:[
    LoginModule,
    DashboardModule
  ]
})
export class PlatformModule { }
