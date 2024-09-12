import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { LoginService } from '../../../services/loginService';
import { AuthService } from '../../../services/authService';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
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
})
export class LoginComponent {
    loginForm: FormGroup;
    email: string = '';
    password: string = '';
    
    hide = true;

    constructor(
        public themeService: CustomizerSettingsService,
        private fb: FormBuilder, private loginService: LoginService, private authService: AuthService,  private router: Router) {
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
            this.authService.setToken(response.token);
            // localStorage.setItem('token', response.token);
            
            // Navigate to the root path
            this.router.navigate(['']);
          },
          error => {
            console.error('Login failed', error);
            // Handle login error here (e.g., show error message)
          }
        );
      }
    }
    
  }
