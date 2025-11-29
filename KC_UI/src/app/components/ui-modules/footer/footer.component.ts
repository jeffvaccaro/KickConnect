import { Component } from '@angular/core';
import pkg from '../../../../../package.json';
import { UiThemeSettingsService } from '../../ui-theme-settings/ui-theme-settings.service';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    appVersion = pkg.version || '0.0.0';

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