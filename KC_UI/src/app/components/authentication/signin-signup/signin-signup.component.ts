import { Component } from '@angular/core';
import { UiThemeSettingsService } from '../../ui-theme-settings/ui-theme-settings.service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-signin-signup',
    standalone: true,
    imports: [RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatCheckboxModule],
    templateUrl: './signin-signup.component.html',
    styleUrls: ['./signin-signup.component.scss']
})
export class SigninSignupComponent {

    hide = true;

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

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

}
