import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomFormValidationService } from '../../../../../services/custom-form-validation.service';
import { EventService } from '../../../../../services/event.service';
import { LocationService } from '../../../../../services/location.service';
import { SchedulerService } from '../../../../../services/scheduler.service';
import { SnackbarService } from '../../../../../services/snackbar.service';
import { UserService } from '../../../../../services/user.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, NativeDateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { DaysEnum } from '../../../../../enums/days';
import { RolesEnum } from '../../../../../enums/roles';
import { UserProfileObject } from '../../../../../objects/user-profile/user-profile';


@Component({
  selector: 'app-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './assignment-dialog.component.html',
  styleUrl: './assignment-dialog.component.scss'
})
export class AssignmentDialogComponent  implements OnInit {
  assignmentForm: FormGroup;
  locationName: string;
  eventName: string;
  eventDay: string;
  eventTime: string;
  eventLength: string;
  userProfileArr: UserProfileObject[];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private eventService: EventService,
    private locationService: LocationService,
    private schedulerService: SchedulerService,
    private snackBarService: SnackbarService,
    private router: Router,
    public dialogRef: MatDialogRef<AssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private customFormValidationService: CustomFormValidationService,
  ) {}

  ngOnInit(): void {
    //this.checkAuthorization();
    this.initializeForm();
    //this.customFormValidationService.setupConditionalValidators(this.eventForm);
    //this.subscribeToFormChanges();
  }

  initializeForm(){

    const today = new Date();
    const closestHour = today.getMinutes() >= 30 ? today.getHours() + 1 : today.getHours();
    const defaultTime = closestHour >= 12 ? `${closestHour - 12 === 0 ? 12 : closestHour - 12}:00 PM` : `${closestHour === 0 ? 12 : closestHour}:00 AM`;
  
    const data = this.data;
    const isReadOnly = data?.existingEventValue !== 'newEvent' && !!data?.existingEventValue;
  
    // Correctly parse selectedDate to avoid timezone issues
    const selectedDate = data?.selectedDate ? new Date(`${data.selectedDate}T00:00:00`) : new Date();
   
    this.locationName = data.locationName;
    this.eventName = data.eventName;
    this.eventDay = DaysEnum[data.day];
    this.eventTime = this.convertTo12Hour(data.selectedTime);
    this.eventLength = data.duration;

    this.assignmentForm = this.fb.group({
      eventId: [data?.existingEventId],
      eventName: [{ value: data?.eventName, disabled: false }],
      eventDescription: [{value: data?.existingEventDescription, disabled: false}],
      locationValues: [data?.locationValues !== undefined ? Number(data.locationValues) : -99, []],
      locationName: [data?.locationName],
      selectedDate: [selectedDate],
      selectedTime: [data?.selectedTime || defaultTime],
      duration: [Number(data?.duration) || 60],
      day: [selectedDate.getDay(), []],
      isRepeat: [data?.isRepeat ?? true, []],
      isActive: [true, []],
      isReservation: [data?.isReservation ?? false, []],
      isCostToAttend: [data?.isCostToAttend ?? false, []],
      reservationCount: [0, []],
      costToAttend: [0, []],
    });

    this.userService.getUsersByLocationAndRole(RolesEnum.Instructor, data.locationValues).subscribe({
      next: response => {
          console.log('getusersbylocationandrole',response);
        },      
      error: error => {
        console.error('Error fetching location data:', error);
        // Handle error here (e.g., show error message)
      }
    });
  }

  trackByProfileId(index: number, userProfileObject: UserProfileObject): number {
    return userProfileObject.profileId;
  }

  save() {
    //
  }
  close() {
    this.dialogRef.close();
  }


  convertTo12Hour(timeValue: string) {
    // Split the input string into hours and minutes
    const [hour, minute] = timeValue.split(':').map(Number);

    // Determine AM or PM
    const ampm = hour >= 12 ? 'PM' : 'AM';

    // Convert 24-hour time to 12-hour time
    const hour12 = hour % 12 || 12;

    // Return formatted time string
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}


}
