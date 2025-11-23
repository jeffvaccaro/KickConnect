import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleService } from '../header/toggle.service';
import { UiThemeSettingsService } from '../../ui-theme-settings/ui-theme-settings.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { StaffService } from '../../../services/staff.service';
import { RoleService } from '../../../services/role.service';

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, NgClass, NgScrollbarModule, MatExpansionModule, RouterLinkActive, CommonModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    @ViewChildren('option') options: QueryList<any>;

    panelOpenState = false;
    isToggled = false;
    accountCode: string;
    accountId: string;
    userName: string;
    userInitial: string;
    roleName: string[] = [];
    availableOptions: number = 0;

    constructor(
        private toggleService: ToggleService,
        public themeService: UiThemeSettingsService, private userService: StaffService, private cdr: ChangeDetectorRef
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
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
    
        this.userService.getStaffName().subscribe(userName => {
          this.userName = userName;
          this.userInitial = userName.charAt(0);
          this.cdr.detectChanges();
        });
    
        this.userService.getRoleName().subscribe(roleName => {
          // console.log('Role in SidebarComponent:', roleName);
          this.roleName.push(roleName);
          this.cdr.detectChanges();
        });    

        this.calculateAvailableOptions();
    }
  
    hasRoles(roles: string[]): boolean {
      return roles.some(role => this.roleName.includes(role));
    }

    toggle() {
        this.toggleService.toggle();
    }

    toggleSidebarTheme() {
        this.themeService.toggleSidebarTheme();
    }

    toggleHideSidebarTheme() {
        this.themeService.toggleHideSidebarTheme();
    }

    calculateAvailableOptions(): void {
      //console.log(this.options);
      this.availableOptions = this.options.length;
      //console.log('Available options:', this.availableOptions);
    }

    
    getDashboardRoute(): string {
      if (this.hasRoles(['Super Admin'])) {
        return '/super-admin';
      } else if (this.hasRoles(['Admin'])) {
        return '/admin';        
      } else if (this.hasRoles(['Owner'])) {
        return '/owner';
      } else if (this.hasRoles(['Instructor'])) {
        return '/instructor';
      } else if (this.hasRoles(['Staff'])) {
        return '/staff';
      }
      return '/default-dashboard'; // fallback
    }

}