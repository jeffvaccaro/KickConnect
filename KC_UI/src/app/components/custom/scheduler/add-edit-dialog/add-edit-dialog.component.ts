import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-edit-dialog',
  templateUrl: './add-edit-dialog.component.html', // Reference the new HTML file
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Ensure this is imported
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule
  ]
})
export class AddEditDialogComponent implements OnInit {
  eventForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      eventName: [this.data?.eventName || ''],
      selectedDate: [this.data?.selectedDate || ''],
      selectedTime: [this.data?.selectedTime || ''],
      duration: [this.data?.duration || 60] // Default to 1 hour if not provided
    });
    console.log('Dialog data:', this.data);
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.eventForm.value); // Pass the form data back to the main component
  }
}
