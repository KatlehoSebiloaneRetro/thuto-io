import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashContainerComponent } from './dash-container/dash-container.component';
import { RewardsContainerComponent } from './rewards-container/rewards-container.component';
import { ProgramContainerComponent } from './program-container/program-container.component';
import { BottomMenuComponent } from './bottom-menu/bottom-menu.component';
import { TuiTabBarModule} from '@taiga-ui/addon-mobile';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { RouterModule } from '@angular/router';
import { SubjectStatComponent } from './subject-stat/subject-stat.component';
import { TuiTabsModule} from '@taiga-ui/kit'
import { TuiSvgModule } from '@taiga-ui/core';
import { CustomTabComponent } from './custom-tab/custom-tab.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule} from '@angular/forms';
import { TuiInputModule} from '@taiga-ui/kit';
import { ALL_TAIGA_UI_MODULES } from 'src/app/all-taiga-ui-modules';


import {ScrollingModule} from '@angular/cdk/scrolling';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaskitoModule} from '@maskito/angular';
import {PolymorpheusModule} from '@tinkoff/ng-polymorpheus';
import { TransactionComponent } from './transaction/transaction.component';
import { SubjectSummaryComponent } from './subject-summary/subject-summary.component';
import { SaveScreenComponent } from './save-screen/save-screen.component';
import { RedeemScreenComponent } from './redeem-screen/redeem-screen.component';
import { TopUpPageComponent } from './top-up-page/top-up-page.component';
import { DetailsComponentComponent } from './details-component/details-component.component';
import { PersonalReportComponent } from './personal-report/personal-report.component';
import {StoryComponent} from "./story/story.component";
import { StoryContainerComponent } from './story-container/story-container.component'

@NgModule({
  declarations: [
    DashContainerComponent,
    RewardsContainerComponent,
    ProgramContainerComponent,
    BottomMenuComponent,
    SubjectStatComponent,
    CustomTabComponent,
    TransactionComponent,
    SubjectSummaryComponent,
    SaveScreenComponent,
    RedeemScreenComponent,
    TopUpPageComponent,
    DetailsComponentComponent,
    PersonalReportComponent,
    StoryComponent,
    StoryContainerComponent
  ],
  imports: [
    CommonModule,
    TuiTabBarModule,
    AppRoutingModule,
    RouterModule,
    TuiTabsModule,
    TuiSvgModule,
    ReactiveFormsModule,
    HttpClientModule,
    TuiInputModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    PolymorpheusModule,
    MaskitoModule,
    RouterModule.forRoot([]),
    ALL_TAIGA_UI_MODULES
  ]
})
export class DashboardModule { }
