import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { ToggleService } from './components/common/header/toggle.service';
import { CustomizerSettingsService } from './components/customizer-settings/customizer-settings.service';
import { SidebarComponent } from './components/common/sidebar/sidebar.component';
import { HeaderComponent } from './components/common/header/header.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { CustomizerSettingsComponent } from './components/customizer-settings/customizer-settings.component';
import { AuthService } from './services/authService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, HeaderComponent, FooterComponent, CustomizerSettingsComponent],
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
    public themeService: CustomizerSettingsService,
    private authService: AuthService
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        localStorage.setItem('lastModule', event.urlAfterRedirects);
        // Scroll to the top after each navigation end
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });

    this.toggleService.isToggled$.subscribe(isToggled => {
      this.isToggled = isToggled;
    });
  }
  

  ngOnInit(): void {
    setTimeout(() => {
      const routePath = this.router.url;
      console.log('Delayed route path:', routePath); // Debugging log
  
      // Allow access to the registration page without any redirects
      if (routePath === '/authentication/register') {
        console.log('User is trying to access registration page, allow it');
        return; // Exit to avoid any redirects
      }
  
      if (this.authService.isAuthenticated()) {
        console.log('User is authenticated');
        const lastModule = localStorage.getItem('lastModule');
        if (lastModule) {
          console.log('Navigating to last module:', lastModule);
          this.router.navigateByUrl(lastModule);
        } else {
          console.log('Navigating to default route /');
          this.router.navigate(['/']); // Default route if no last module
        }
      } else {
        console.log('User not authenticated');
        this.router.navigate(['/authentication']);
      }
    }, 100); // Adjust the delay as needed
  }
  
  

}
