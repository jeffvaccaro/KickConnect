import { Component } from '@angular/core';
import { UiThemeSettingsService } from '../../ui-theme-settings/ui-theme-settings.service';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

    constructor(
        public themeService: UiThemeSettingsService
    ) {}

    toggleCardBorderTheme() {
        this.themeService.toggleCardBorderTheme();
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleCardBorderRadiusTheme() {
        this.themeService.toggleCardBorderRadiusTheme();
    }

    ngOnInit(): void {
        // console.log('FooterComponent initialized');
    }
}