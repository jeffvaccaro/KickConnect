import { Component } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-attendance-display',
  standalone: true,
  imports: [QRCodeModule],
  templateUrl: './attendance-display.component.html',
  styleUrl: './attendance-display.component.scss'
})
export class AttendanceDisplayComponent {

}
