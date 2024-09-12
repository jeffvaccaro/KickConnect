import { Component, ViewEncapsulation } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'custom-user',
  standalone: true,
  imports: [MatMenuModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserComponent {

}
