import { Component } from '@angular/core';
import { UiThemeSettingsService } from './ui-theme-settings.service';
import { NgClass } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-ui-theme-settings',
    imports: [NgClass, NgScrollbarModule, MatDividerModule, MatButtonModule, MatIconModule],
    templateUrl: './ui-theme-settings.component.html',
    styleUrls: ['./ui-theme-settings.component.scss']
})
export class UiThemeSettingsComponent {

    isToggled = false;
    
    constructor(
        public themeService: UiThemeSettingsService
    ) {
        this.themeService.isToggled$.subscribe((isToggled: boolean) => {
            this.isToggled = isToggled;
        });
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleSidebarTheme() {
        this.themeService.toggleSidebarTheme();
    }

    toggleRightSidebarTheme() {
        this.themeService.toggleRightSidebarTheme();
    }

    toggleHideSidebarTheme() {
        this.themeService.toggleHideSidebarTheme();
    }

    toggleHeaderTheme() {
        this.themeService.toggleHeaderTheme();
    }

    toggleCardBorderTheme() {
        this.themeService.toggleCardBorderTheme();
    }

    toggleCardBorderRadiusTheme() {
        this.themeService.toggleCardBorderRadiusTheme();
    }

    toggle() {
        this.themeService.toggle();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

}