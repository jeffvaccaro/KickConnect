import { Component } from '@angular/core';
import { LocationListComponent } from '../../modules/locations/location-list/location-list.component';
import { StaffListComponent } from '@app/components/modules/staff/staff-list/staff-list.component';

@Component({
    selector: 'app-owner',
    imports: [
        LocationListComponent,
        StaffListComponent
    ],
    templateUrl: './owner.component.html',
    styleUrl: './owner.component.scss'
})
export class OwnerComponent {

}

