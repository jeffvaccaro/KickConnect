import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { IReservationCount } from '../../../../interfaces/reservation-count';
import { catchError, forkJoin, of } from 'rxjs';
import { isReactive } from '@angular/core/primitives/signals';
import { CustomFormValidationService } from '../../../../services/custom-form-validation.service';

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
  reservationCounts: IReservationCount[] = [];
  classes: IClass[] = [];
  locations: ILocations[] = [];
  accountId: number;
  isNewEventClass: boolean = true;
  isNew: string;
  setReservation: boolean = false;
  setCostToAttend: boolean = false;
  isReadOnly : boolean;

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
    private cdr: ChangeDetectorRef,
    private customFormValidationService: CustomFormValidationService
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


    // Ensure data exists before accessing properties
    const existingClassValue = this.data?.existingClassValue || 'newEventClass';
    const existingClassName = this.data?.existingClassName || '';
    const eventName = this.data?.eventName || '';
    const eventDescription = this.data?.existingClassDescription || '';
    const selectedTime = this.data?.selectedTime || defaultTime;
    const duration = Number(this.data?.duration) || 60;
    const locationValues = this.data?.locationValues !== undefined ? Number(this.data.locationValues) : -99;
    const accountId = this.data?.accountId || 0;
    const scheduleMainId = this.data?.scheduleMainId || 0;
    const isRepeat = this.data?.isRepeat || false;
    const isReservation = this.data?.isReservation || false;
    const isCostToAttend = this.data?.isCostToAttend || false;
    const reservationCount = this.data?.reservationCount || 1;
    const costToAttend = this.data?.costToAttend || '';
    const isReadOnly = existingClassValue !== 'newEventClass';


  
    this.eventForm = this.fb.group({
      existingClassValue: [{ value: existingClassValue, disabled: isReadOnly }, []],
      existingClassName: [{ value: existingClassName, disabled: isReadOnly }, []],
      eventName: [{ value: eventName, disabled: isReadOnly }, []],
      eventDescription: [{ value: eventDescription, disabled: isReadOnly }, []],
      locationValues: [{ value: locationValues, disabled: isReadOnly }, []],

      selectedDate: [localSelectedDate],
      selectedTime: [selectedTime],
      duration: [duration],
      accountId: [accountId],
      scheduleMainId: [scheduleMainId],
      dayNumber: [dayNumber],
      isRepeat: [{ value: isRepeat, disabled: isReadOnly }, []],
      isActive: [true],
      isReservation: [{ value: isReservation, disabled: isReadOnly }, []],
      isCostToAttend: [{ value: isCostToAttend, disabled: isReadOnly }, []],
      reservationCount: [{ value: reservationCount, disabled: isReadOnly }, []],
      costToAttend: [{ value: costToAttend, disabled: isReadOnly }, []],
    });
  
    // Setup custom validators
    this.customFormValidationService.setupConditionalValidators(this.eventForm);

    // Update the flag when the value changes
    this.eventForm.get('existingClassValue')?.valueChanges.subscribe(value => {
      const isExistingClassValuePopulated = !!value;
      this.customFormValidationService.updateFormControlStates(this.eventForm, isExistingClassValuePopulated);
    });  

    this.eventForm.get('selectedDate')?.valueChanges.subscribe(selectedDate => {
      const dayNumber = new Date(selectedDate).getDay();
      this.eventForm.patchValue({ dayNumber });
    });

      // Set the flag based on initial value
      this.isReadOnly = !!this.eventForm.get('existingClassValue')?.value;

      // Update the flag when the value changes
      this.eventForm.get('existingClassValue')?.valueChanges.subscribe(value => {
          this.isReadOnly = !!value;
      });
      this.snackBarService.openSnackBar('existingClassValue:' +  this.isReadOnly, '', []);

    this.userService.getAccountId().subscribe(accountId => {
      this.accountId = Number(accountId);
      this.eventForm.get('accountId')?.setValue(Number(this.accountId));
      this.cdr.detectChanges();
    });
  
    forkJoin({
      durations: this.schedulerService.getDurations().pipe(
        catchError(error => {
          this.snackBarService.openSnackBar('Error Fetching Duration data:' + error.message, '', []);
          return of(null); // Provide a fallback value if necessary
        })
      ),
      reservationCounts: this.schedulerService.getReservationCount().pipe(
        catchError(error => {
          this.snackBarService.openSnackBar('Error Fetching ReservationCount data:' + error.message, '', []);
          return of(null);
        })
      ),
      activeClasses: this.classService.getActiveClasses(this.accountId).pipe(
        catchError(error => {
          this.snackBarService.openSnackBar('Error Fetching Class data:' + error.message, '', []);
          return of(null);
        })
      ),
      locations: this.locationService.getLocations('active').pipe(
        catchError(error => {
          this.snackBarService.openSnackBar('Error Fetching Location data:' + error.message, '', []);
          return of(null);
        })
      )
    }).subscribe({
      next: response => {
        this.durations = response.durations;
        this.reservationCounts = response.reservationCounts;
        this.classes = response.activeClasses;
        this.locations = response.locations;
      },
      error: error => {
        this.snackBarService.openSnackBar('General Error Fetching data:' + error.message, '', []);
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
    if (this.eventForm.valid) {
      console.log('Form values before closing:', this.eventForm.value); 
      this.dialogRef.close(this.eventForm.value);
    } else {
      this.eventForm.markAllAsTouched();
  
      const invalidFields = [];
      const controls = this.eventForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalidFields.push(name);
        }
      }
  
      // Force validation on save
      const eventDescriptionControl = this.eventForm.get('eventDescription');
      if (eventDescriptionControl && !eventDescriptionControl.value) {
        eventDescriptionControl.setValidators([Validators.required]);
        eventDescriptionControl.setErrors({ required: true });
        eventDescriptionControl.updateValueAndValidity();
      }
    }
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

  onReservationChange(event:any){
    if(event.checked === true){
      this.setReservation = true;
    }else{
      this.setReservation = false;
    }
  }

  onCostToAttendChange(event:any){
    if(event.checked === true){
      this.setCostToAttend = true;
    }else{
      this.setCostToAttend = false;
    }
  }

}
