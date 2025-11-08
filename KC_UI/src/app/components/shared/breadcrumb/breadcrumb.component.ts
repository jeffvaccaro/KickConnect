import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, RouterLink] 
})
export class BreadcrumbComponent {
  /** The final, current page title (e.g., "Add New Event"). */
  @Input() pageTitle: string = '';

  /** Array of preceding breadcrumb links. */
  // Ensure this is initialized to an empty array for safety
  @Input() breadcrumbItems: { label: string; link?: string }[] = []; 
}