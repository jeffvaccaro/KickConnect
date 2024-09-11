import { Component } from '@angular/core';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { LoginService } from '../../../services/loginService';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        RouterLink, 
        MatButtonModule, 
        MatFormFieldModule, 
        MatInputModule, 
        MatIconModule, 
        MatCheckboxModule,
        ReactiveFormsModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    // providers: [LoginService]
})
export class LoginComponent {
    loginForm: FormGroup;
    email: string = '';
    password: string = '';
    
    hide = true;

    constructor(
        public themeService: CustomizerSettingsService,
        private fb: FormBuilder, private loginService: LoginService) {
          this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
          });
        }

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

    onSubmit() {
      if (this.loginForm.valid) {
        const { email, password } = this.loginForm.value;
        this.loginService.login(email, password).subscribe(
          response => {
            console.log('Login successful', response);
            // Handle successful login here (e.g., navigate to another page)
          },
          error => {
            console.error('Login failed', error);
            // Handle login error here (e.g., show error message)
          }
        );
      }
    }
  }
