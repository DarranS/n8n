import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { AppComponent } from './app.component';
import { AboutComponent } from './components/about/about.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    AboutComponent
  ],
  providers: [MarkdownService],
  bootstrap: [AppComponent]
})
export class AppModule { } 