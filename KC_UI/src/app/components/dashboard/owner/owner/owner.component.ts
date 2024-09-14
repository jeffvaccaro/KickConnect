import { Component } from '@angular/core';
import { LocationListComponent } from '../../../custom/locations/location-list/location-list.component';

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [LocationListComponent],
  templateUrl: './owner.component.html',
  styleUrl: './owner.component.scss'
})
export class OwnerComponent {

}
