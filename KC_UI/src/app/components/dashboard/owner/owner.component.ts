import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
// import { LocationListComponent } from '../../modules/locations/location-list/location-list.component';
// import { StaffListComponent } from '@app/components/modules/staff/staff-list/staff-list.component';
import { MatCardModule } from '@angular/material/card';
import { BreadcrumbComponent } from '@app/components/shared/breadcrumb/breadcrumb.component';
import { LocationService } from '../../../services/location.service';
import { StaffService } from '@app/services/staff.service';
import { EventService } from '@app/services/event.service';
import { SchedulerService } from '@app/services/scheduler.service';
import { forkJoin, map } from 'rxjs';

@Component({
    selector: 'app-owner',
    imports: [
        CommonModule,
        MatCardModule,
        BreadcrumbComponent,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './owner.component.html',
    styleUrl: './owner.component.scss'
})
export class OwnerComponent {
  activeLocationsCount: number | null = null;
  loadingActiveLocations = true;
  activeLocationsError: string | null = null;
  accountCode: string = '';
  accountId: string = '';
  // Staff
  activeStaffCount: number | null = null;
  loadingActiveStaff = true;
  // Instructors
  activeInstructorCount: number | null = null;
  loadingActiveInstructors = true;
  // Events
  activeEventCount: number | null = null;
  loadingActiveEvents = true;
  // Scheduled classes
  scheduledClassesCount: number | null = null;
  loadingScheduledClasses = true;

  constructor(
    private locationService: LocationService,
    private staffService: StaffService,
    private eventService: EventService,
    private schedulerService: SchedulerService
  ) {}

  ngOnInit() {
    // Capture account context from StaffService (seeded from localStorage)
    this.staffService.getAccountCode().subscribe(code => {
      if (code) this.accountCode = code;
    });
    this.staffService.getAccountId().subscribe(id => {
      if (id) {
        this.accountId = id;
        // Prefer account-scoped active locations for Owner view
        const acctIdNum = Number(id);
        this.loadActiveLocationsForAccount(acctIdNum);
        this.loadActiveStaffForAccount(acctIdNum);
        this.loadActiveEventsForAccount(acctIdNum);
      }
    });
  }

  private loadActiveLocationsForAccount(accountId: number) {
    this.loadingActiveLocations = true;
    this.locationService.getActiveLocationsByAccountId(accountId).subscribe({
      next: (locations) => {
        this.activeLocationsCount = Array.isArray(locations) ? locations.length : 0;
        this.loadingActiveLocations = false;
        // After we have location IDs, compute scheduled classes
        const ids = (locations || []).map((l: any) => l.locationId).filter((v: any) => typeof v === 'number');
        this.loadScheduledClassesForLocations(ids);
      },
      error: (error) => {
        console.error('Error fetching active locations by account:', error);
        this.activeLocationsError = 'Failed to load locations';
        this.loadingActiveLocations = false;
        this.scheduledClassesCount = 0; // fallback
        this.loadingScheduledClasses = false;
      }
    });
  }

  private loadActiveStaffForAccount(accountId: number) {
    this.loadingActiveStaff = true;
    this.loadingActiveInstructors = true;
    this.staffService.getStaffsByStatus(accountId, 'Active').subscribe({
      next: (staffList: any[]) => {
        this.activeStaffCount = Array.isArray(staffList) ? staffList.length : 0;
        // roleId is concatenated string like "5,6"; Instructor=5
        const instructors = (staffList || []).filter((s: any) =>
          typeof s.roleId === 'string' ? s.roleId.split(',').includes('5') : false
        );
        this.activeInstructorCount = instructors.length;
        this.loadingActiveStaff = false;
        this.loadingActiveInstructors = false;
      },
      error: () => {
        this.activeStaffCount = 0;
        this.activeInstructorCount = 0;
        this.loadingActiveStaff = false;
        this.loadingActiveInstructors = false;
      }
    });
  }

  private loadActiveEventsForAccount(accountId: number) {
    this.loadingActiveEvents = true;
    this.eventService.getActiveEvents(accountId).subscribe({
      next: (events: any[]) => {
        this.activeEventCount = Array.isArray(events) ? events.length : 0;
        this.loadingActiveEvents = false;
      },
      error: () => {
        this.activeEventCount = 0;
        this.loadingActiveEvents = false;
      }
    });
  }

  private loadScheduledClassesForLocations(locationIds: number[]) {
    if (!locationIds.length) {
      this.scheduledClassesCount = 0;
      this.loadingScheduledClasses = false;
      return;
    }
    this.loadingScheduledClasses = true;
    const calls = locationIds.map(id => this.schedulerService.getSchedulesWithAssignmentsByLocation(id).pipe(map((arr: any[]) => arr?.length || 0)));
    forkJoin(calls).subscribe({
      next: (counts: number[]) => {
        this.scheduledClassesCount = counts.reduce((sum, n) => sum + n, 0);
        this.loadingScheduledClasses = false;
      },
      error: () => {
        this.scheduledClassesCount = 0;
        this.loadingScheduledClasses = false;
      }
    });
  }


}


