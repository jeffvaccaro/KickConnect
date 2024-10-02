import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, NativeDateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@Component({
  selector: 'app-add-edit-dialog',
  templateUrl: './add-edit-dialog.component.html', // Reference the new HTML file
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Ensure this is imported
    MatButtonModule,
    MatInputModule,
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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Data:', this.data);
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();
    const closestHour = currentMinutes >= 30 ? currentHour + 1 : currentHour;
    const defaultTime = closestHour >= 12 ? `${closestHour - 12 === 0 ? 12 : closestHour - 12}:00 PM` : `${closestHour === 0 ? 12 : closestHour}:00 AM`;
  
    const selectedDateString = this.data?.selectedDate || today.toISOString().split('T')[0];
    const [year, month, day] = selectedDateString.split('-').map(Number);
    const localSelectedDate = new Date(year, month - 1, day);
  
    console.log('duration:', this.data.duration);
    this.eventForm = this.fb.group({
      eventName: [this.data?.eventName || ''],
      selectedDate: [localSelectedDate],
      selectedTime: [this.data?.selectedTime || defaultTime],
      duration: [Number(this.data?.duration) || 60]
    });
    // console.log('event form duration:', this.eventForm.controls['duration'].value);
  
    this.eventForm.get('selectedDate')?.setValue(localSelectedDate);
    this.eventForm.get('selectedTime')?.setValue(this.data?.selectedTime || defaultTime);
    this.eventForm.get('duration')?.setValue(Number(this.data?.duration) || 60);
    this.cdr.detectChanges(); // Trigger change detection

    // console.log('event form duration after initialization:', this.eventForm.controls['duration'].value);
  }
  

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.eventForm.value); // Pass the form data back to the main component
  }
}
