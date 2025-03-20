import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { WebModule } from './web/web.module';
import { PlatformModule } from './platform/platform.module';
import { EntrepreneurModule } from "./platform/entrepreneur/entrepreneur.module";
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { ServiceWorkerModule } from '@angular/service-worker';
import { DashboardModule } from "./platform/dashboard/dashboard.module";
import { StoryService } from "./platform/dashboard/services/stories.service";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    WebModule,
    EntrepreneurModule,
    PlatformModule,
    DashboardModule,
    BrowserAnimationsModule,
    TuiRootModule,
    TuiDialogModule,
    TuiAlertModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideMessaging(() => getMessaging()),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately'
    })
  ],
  providers: [
    {provide: TUI_SANITIZER, useClass: NgDompurifySanitizer},
    StoryService
  ],
  bootstrap: [AppComponent],
  exports:[PlatformModule]
})
export class AppModule { }  // Remove the constructor