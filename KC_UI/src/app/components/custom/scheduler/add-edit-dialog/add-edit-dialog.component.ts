
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
import { SchedulerService } from '../../../../services/scheduler.service';
import { SnackbarService } from '../../../../services/snackbar.service';

import { Duration } from '../../../../interfaces/duration';
import { Classes } from '../../../../interfaces/classes';


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
  durations: Duration[] = [];
  classes: Classes[] = [];
  accountId: number;
  isNewEventClass: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private classService: ClassService,
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
  

     this.eventForm = this.fb.group({
      existingClass: [this.data?.existingClassId || 'newEventClass'],
      existingClassName: [this.data?.existingClassName || ''],
      eventName: [this.data?.eventName || ''],
      eventDescription: [this.data?.existingClassDescription || ''],
      selectedDate: [localSelectedDate],
      selectedTime: [this.data?.selectedTime || defaultTime],
      duration: [Number(this.data?.duration) || 60],
      isRepeat: [this.data?.isRepeat || false]
    });
    // console.log('event form duration:', this.eventForm.controls['duration'].value);
  
    this.eventForm.get('selectedDate')?.setValue(localSelectedDate);
    this.eventForm.get('selectedTime')?.setValue(this.data?.selectedTime || defaultTime);
    this.eventForm.get('duration')?.setValue(Number(this.data?.duration) || 60);
    this.cdr.detectChanges(); // Trigger change detection

    // console.log('event form duration after initialization:', this.eventForm.controls['duration'].value);

    this.userService.getAccountId().subscribe(accountId => {
      this.accountId = Number(accountId);
      this.cdr.detectChanges();
    });

    this.schedulerService.getDurations().subscribe({
      next: response => {
        this.durations = response
      },
      error: error => {
        this.snackBarService.openSnackBar('Error Fetching Duration data:' + error.message, '',  []);
      }
    });

    this.classService.getActiveClasses(this.accountId).subscribe({
      next: response => {
        this.classes = response
      },
      error: error => {
        this.snackBarService.openSnackBar('Error Fetching Duration data:' + error.message, '',  []);
      }
    });
  }
  

  close() {
    this.dialogRef.close();
  }

  save() {
    // console.log('eventForm.value', this.eventForm.value);
    this.dialogRef.close(this.eventForm.value); // Pass the form data back to the main component
  }

  enableDisable(event: any){
    let selectedValue = event.value;
    if(typeof selectedValue === 'number'){
      this.isNewEventClass = false;
      this.eventForm.get('existingClassName')?.setValue(this.classes[selectedValue]?.className);
      this.eventForm.get('eventDescription')?.setValue(this.classes[selectedValue]?.classDescription);
    }else{
      this.isNewEventClass = true;
      this.eventForm.get('eventDescription')?.setValue('');
    }
  }
}
