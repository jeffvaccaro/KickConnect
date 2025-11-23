import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToggleService } from './toggle.service';
import { NgClass, DatePipe } from '@angular/common';
import { UiThemeSettingsService } from '../../ui-theme-settings/ui-theme-settings.service';
import { Router, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StaffService } from '../../../services/staff.service';

@Component({
    selector: 'app-header',
    imports: [RouterLink, NgClass, MatMenuModule, MatIconModule, MatButtonModule, DatePipe,],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    isToggled = false;
      accountCode: string;
      accountId: string;
      staffId: string;
      userName: string;
      userInitial: string;
      roleName: string;

    constructor(
        private toggleService: ToggleService,
        public themeService: UiThemeSettingsService,
        private userService: StaffService, private cdr: ChangeDetectorRef, private router: Router
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
        this.currentDate = new Date();
    }

    ngOnInit(): void {
        this.userService.getAccountCode().subscribe(accountCode => {
          this.accountCode = accountCode;
          this.cdr.detectChanges();
        });
    
        this.userService.getAccountId().subscribe(accountId => {
          this.accountId = accountId;
          this.cdr.detectChanges();
        });

        this.userService.getStaffId().subscribe(staffId => {
            this.staffId = staffId;
            this.cdr.detectChanges();
        })
    
        this.userService.getStaffName().subscribe(userName => {
          this.userName = userName;
          this.userInitial = userName.charAt(0);
          this.cdr.detectChanges();
        });
    
        this.userService.getRoleName().subscribe(roleName => {
          this.roleName = roleName;
          this.cdr.detectChanges();
        });
    
      }

    currentDate: Date;
    toggle() {
        this.toggleService.toggle();
    }
    profile(){
        this.router.navigate(['app-edit-staff', this.accountId]);
    }

    // toggleTheme() {
    //     this.themeService.toggleTheme();
    // }


    // toggleSidebarTheme() {
    //     this.themeService.toggleSidebarTheme();
    // }

    // toggleHideSidebarTheme() {
    //     this.themeService.toggleHideSidebarTheme();
    // }

    // toggleCardBorderTheme() {
    //     this.themeService.toggleCardBorderTheme();
    // }

    // toggleHeaderTheme() {
    //     this.themeService.toggleHeaderTheme();
    // }

    // toggleCardBorderRadiusTheme() {
    //     this.themeService.toggleCardBorderRadiusTheme();
    // }

    // toggleRTLEnabledTheme() {
    //     this.themeService.toggleRTLEnabledTheme();
    // }

}