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
    if (this.authService.isAuthenticated()) {
      const lastModule = localStorage.getItem('lastModule');
      if (lastModule) {
        this.router.navigateByUrl(lastModule);
      } else {
        this.router.navigate(['/']); // Default route if no last module
      }
    } else {
      this.router.navigate(['/authentication']);
    }
  }
}
