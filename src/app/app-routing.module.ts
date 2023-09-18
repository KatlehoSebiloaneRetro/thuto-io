import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './web/home/home.component';
import { ThutorComponent } from './web/thutor/thutor.component';

const routes: Routes = [
  { path: '',component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'thutor', component: ThutorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
