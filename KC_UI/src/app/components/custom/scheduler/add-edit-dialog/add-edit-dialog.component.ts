import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, NativeDateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { UserService } from '../../../../services/user.service';
import { ClassService } from '../../../../services/class.service';
import { LocationService } from '../../../../services/location.service';
import { SchedulerService } from '../../../../services/scheduler.service';
import { SnackbarService } from '../../../../services/snackbar.service';
import { IDuration } from '../../../../interfaces/duration';
import { IClass } from '../../../../interfaces/classes';
import { ILocations } from '../../../../interfaces/locations';

@Component({
  selector: 'app-add-edit-dialog',
  templateUrl: './add-edit-dialog.component.html', // Reference the new HTML file
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Ensure this is imported
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ]
})
export class AddEditDialogComponent implements OnInit {
  eventForm: FormGroup;
  durations: IDuration[] = [];
  classes: IClass[] = [];
  locations: ILocations[] = [];
  accountId: number;
  isNewEventClass: boolean = true;
  isNew: string;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private classService: ClassService,
    private locationService: LocationService,
    private schedulerService: SchedulerService,
    private snackBarService: SnackbarService,
    private router: Router,
    public dialogRef: MatDialogRef<AddEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();
    const closestHour = currentMinutes >= 30 ? currentHour + 1 : currentHour;
    const defaultTime = closestHour >= 12 ? `${closestHour - 12 === 0 ? 12 : closestHour - 12}:00 PM` : `${closestHour === 0 ? 12 : closestHour}:00 AM`;
  
    const selectedDateString = this.data?.selectedDate || today.toISOString().split('T')[0];
    const [year, month, day] = selectedDateString.split('-').map(Number);
    const localSelectedDate = new Date(year, month - 1, day);
    const dayNumber = localSelectedDate.getDay(); // Calculate initial day number
  
    this.eventForm = this.fb.group({
      existingClassValue: [this.data?.existingClassValue || 'newEventClass'],
      existingClassName: [this.data?.existingClassName || ''],
      eventName: [this.data?.eventName || ''],
      eventDescription: [this.data?.existingClassDescription || ''],
      selectedDate: [localSelectedDate],
      selectedTime: [this.data?.selectedTime || defaultTime],
      duration: [Number(this.data?.duration) || 60],
      locationValues: [this.data?.locationValues !== undefined ? Number(this.data.locationValues) :Number(-99)],
      isRepeat: [this.data?.isRepeat || false],
      accountId: [this.data?.accountId || 0],
      dayNumber: [dayNumber],
      isActive: [true]
    });
  
    // Watch for changes in selectedDate and update dayNumber accordingly
    this.eventForm.get('selectedDate')?.valueChanges.subscribe(selectedDate => {
      const dayNumber = new Date(selectedDate).getDay();
      this.eventForm.patchValue({ dayNumber });
    });
  
    this.userService.getAccountId().subscribe(accountId => {
      this.accountId = Number(accountId);
      this.eventForm.get('accountId')?.setValue(Number(this.accountId));
      this.cdr.detectChanges();
    });
  
    this.schedulerService.getDurations().subscribe({
      next: response => {
        this.durations = response;
      },
      error: error => {
        this.snackBarService.openSnackBar('Error Fetching Duration data:' + error.message, '', []);
      }
    });
  
    this.classService.getActiveClasses(this.accountId).subscribe({
      next: response => {
        this.classes = response;
        // console.log('classes', this.classes);
      },
      error: error => {
        this.snackBarService.openSnackBar('Error Fetching Class data:' + error.message, '', []);
      }
    });
  
    this.locationService.getLocations('active').subscribe({
      next: response => {
        this.locations = response;
      },
      error: error => {
        this.snackBarService.openSnackBar('Error Fetching Location data:' + error.message, '', []);
      }
    });

    if(this.data?.isNew === undefined){
      this.isNew = "Add New";
    }else{
      this.isNew = "Update";
    }
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.eventForm.value); // Pass the form data back to the main component
  }

  enableDisable(event: any) {
    const eventId = event.value;
    const selectedIndex = this.classes.findIndex(event => event.classId === eventId); // Get the index directly

    if (selectedIndex !== -1) {

      this.isNewEventClass = false;
      const selectedClass = this.classes[selectedIndex];
      this.eventForm.get('existingClassName')?.setValue(selectedClass.className);
      this.eventForm.get('eventDescription')?.setValue(selectedClass.classDescription);
      this.eventForm.get('eventName')?.setValue('');
    } else {
      this.isNewEventClass = true;
      this.eventForm.get('eventDescription')?.setValue('');
    }
  }
}
