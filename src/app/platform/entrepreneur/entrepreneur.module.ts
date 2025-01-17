
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MaskitoModule } from '@maskito/angular';
import { TuiTabBarModule } from '@taiga-ui/addon-mobile';
import { TuiSvgModule } from '@taiga-ui/core';
import { TuiTabsModule, TuiInputModule } from '@taiga-ui/kit';
import { PolymorpheusModule } from '@tinkoff/ng-polymorpheus';
import { ALL_TAIGA_UI_MODULES } from 'src/app/all-taiga-ui-modules';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { BottomMenuComponent } from './bottom-menu/bottom-menu.component';
import { CustomTabComponent } from './custom-tab/custom-tab.component';
import { EntDashContainerComponent } from './dash-container/dash-container.component';
import { EntDetailsComponentComponent } from './details-component/details-component.component';
import { EntPersonalReportComponent } from './personal-report/personal-report.component';
import { EntProgramContainerComponent } from './program-container/program-container.component';
import { EntRedeemScreenComponent } from './redeem-screen/redeem-screen.component';
import { EntRewardsContainerComponent } from './rewards-container/rewards-container.component';
import { SubjectStatComponent } from './subject-stat/subject-stat.component';
import { SubjectSummaryComponent } from './subject-summary/subject-summary.component';
import { EntTopUpPageComponent } from './top-up-page/top-up-page.component';
import { TransactionComponent } from './transaction/transaction.component';


@NgModule({
  declarations: [
    EntDashContainerComponent,
    EntRewardsContainerComponent,
    EntProgramContainerComponent,
    BottomMenuComponent,
    SubjectStatComponent,
    CustomTabComponent,
    TransactionComponent,
    SubjectSummaryComponent,
    EntRedeemScreenComponent,
    EntTopUpPageComponent,
    EntDetailsComponentComponent,
    EntPersonalReportComponent,
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
    FormsModule,
    ScrollingModule,
    PolymorpheusModule,
    MaskitoModule,
    RouterModule.forRoot([]),
    ALL_TAIGA_UI_MODULES
  ]
})
export class EntrepreneurModule { }
