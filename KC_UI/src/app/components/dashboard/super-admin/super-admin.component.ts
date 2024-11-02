import { Component } from '@angular/core';
import { AccountListComponent } from '../../custom/accounts/account-list/account-list.component';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [AccountListComponent],
  templateUrl: './super-admin.component.html',
  styleUrl: './super-admin.component.scss'
})
export class SuperAdminComponent {

}
