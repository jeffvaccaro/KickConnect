import { Component } from '@angular/core';
import { UiThemeSettingsService } from '../../ui-theme-settings/ui-theme-settings.service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-confirm-mail',
    standalone: true,
    imports: [RouterLink, MatButtonModule],
    templateUrl: './confirm-mail.component.html',
    styleUrls: ['./confirm-mail.component.scss']
})
export class ConfirmMailComponent {

    constructor(
        public themeService: UiThemeSettingsService
    ) {}

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleCardBorderTheme() {
        this.themeService.toggleCardBorderTheme();
    }

    toggleCardBorderRadiusTheme() {
        this.themeService.toggleCardBorderRadiusTheme();
    }

}
