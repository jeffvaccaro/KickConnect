import { Component } from '@angular/core';
import { LocationListComponent } from '../../../custom/locations/location-list/location-list.component';
import { AddNewLocationComponent } from '../../../custom/locations/add-new-location/add-new-location.component';

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [LocationListComponent,AddNewLocationComponent],
  templateUrl: './owner.component.html',
  styleUrl: './owner.component.scss'
})
export class OwnerComponent {

}
