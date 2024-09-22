import { Component } from '@angular/core';
import { LocationListComponent } from '../../../custom/locations/location-list/location-list.component';
import { AddNewLocationComponent } from '../../../custom/locations/add-new-location/add-new-location.component';
import { EditLocationComponent } from '../../../custom/locations/edit-location/edit-location.component';
import { UserListComponent } from '../../../custom/user/user-list/user-list.component';
import { AddNewUserComponent } from '../../../custom/user/add-new-user/add-new-user.component';
import { EditUserComponent } from '../../../custom/user/edit-user/edit-user.component';

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [LocationListComponent,AddNewLocationComponent, EditLocationComponent, UserListComponent, AddNewUserComponent, EditUserComponent],
  templateUrl: './owner.component.html',
  styleUrl: './owner.component.scss'
})
export class OwnerComponent {

}

