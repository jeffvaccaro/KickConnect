import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { ToggleService } from './components/ui-modules/header/toggle.service';
import { UiThemeSettingsService } from './components/ui-theme-settings/ui-theme-settings.service';
import { SidebarComponent } from './components/ui-modules/sidebar/sidebar.component';
import { HeaderComponent } from './components/ui-modules/header/header.component';
import { FooterComponent } from './components/ui-modules/footer/footer.component';
import { UiThemeSettingsComponent } from './components/ui-theme-settings/ui-theme-settings.component';
import { AuthService } from './services/authService';
import pkg from '../../package.json';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule, SidebarComponent, HeaderComponent, FooterComponent, UiThemeSettingsComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'kickConnect';
  isToggled = false;

  constructor(
    public router: Router,
    private toggleService: ToggleService,
    private viewportScroller: ViewportScroller,
    public themeService: UiThemeSettingsService,
    private authService: AuthService
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        localStorage.setItem('lastModule', event.urlAfterRedirects);
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });

    this.toggleService.isToggled$.subscribe(isToggled => {
      this.isToggled = isToggled;
    });
  }

  ngOnInit(): void {
    document.title = 'kickConnect';
  }
  
  isBlankPage(): boolean {
    const url = this.router.url;
    const result = url.includes('/error-500') || 
           url.includes('/reset-password') || 
           url.includes('/forgot-password') || 
           url.includes('/login') || 
           url.includes('/register') || 
           url.includes('/signin-signup') || 
           url.includes('/logout') || 
           url.includes('/confirm-mail') || 
           url.includes('/lock-screen') || 
           url.includes('/coming-soon')
    return result;
           
  }
  
}
