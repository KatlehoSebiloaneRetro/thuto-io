import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { FeatureComponent } from './feature/feature.component';
import { BannerComponent } from './banner/banner.component';
import { ReviewComponent } from './review/review.component';
import { CredComponent } from './cred/cred.component';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './nav/nav.component';
import { HeaderComponent } from './header/header.component';
import { TextComponent } from './text/text.component';
import {  RouterModule } from '@angular/router';
import { ThutorComponent } from './thutor/thutor.component';


@NgModule({
  declarations: [
    FooterComponent,
    FeatureComponent,
    BannerComponent,
    ReviewComponent,
    CredComponent,
    HomeComponent,
    NavComponent,
    HeaderComponent,
    TextComponent,
    ThutorComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class WebModule { }
