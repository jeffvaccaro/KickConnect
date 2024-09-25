import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

import { CommonModule } from '@angular/common';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { ClassService } from '../../../../services/class.service';
import { SnackbarService } from '../../../../services/snackbar.service';

@Component({
  selector: 'app-edit-class',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatCheckboxModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatSelectModule
  ],
  templateUrl: './edit-class.component.html',
  styleUrls: ['./edit-class.component.scss']
})
export class EditClassComponent implements OnInit {
  form: FormGroup;
  classId: number;
  accountCode: string;
  accountId: number;

  constructor(private fb: FormBuilder, private classService: ClassService, private snackBarService: SnackbarService, 
              private userService: UserService, private commonService: CommonService, private route: ActivatedRoute, 
              private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nameControl: ['', Validators.required],
      descriptionControl: ['', [Validators.required]],
      isActiveControl: [true]
    });

    this.userService.getAccountCode().subscribe(accountCode => {
      this.accountCode = accountCode;
      this.cdr.detectChanges();
    });

    this.userService.getAccountId().subscribe(accountId => {
      this.accountId = Number(accountId);
      this.cdr.detectChanges;
    })

    // Get the roleId from the route parameters
    this.route.params.subscribe(params => {
      this.classId = +params['classId']; // Assuming 'id' is the route parameter name
      this.loadClassData(this.classId);
    });
  }

  loadClassData(classId: number): void {
    this.classService.getClassById(this.accountId, classId).subscribe({
      next: response => {
        this.form.patchValue({
          nameControl: response.className,
          descriptionControl: response.classDescription,
          isActiveControl: response.isActive === 0
        });
      },
      error: error => {
        this.snackBarService.openSnackBar('Error fetching Role data:' + error.message, '',  []);
      }
    });
  }
  
  onSubmit(event: Event): void {
    event.preventDefault(); // Prevent the default form submission
    //console.log('location form info', this.form.value); // Log the form values
  

    let classData = {
      className: this.form.value.nameControl,
      classDescription: this.form.value.descriptionControl,
      isActive: this.form.value.isActiveControl ? 0 : 1,
    };
  
    //console.log('classData:', classData); // Log the data being sent to the server
  
    // Call the updateLocation method and pass the form values along with accountId
    this.classService.updateClass(this.classId, classData).subscribe({
      next: response => {
        // console.log('Role updated successfully:', response); // Log the response
        this.router.navigate(['/app-class-list']); // Navigate to role-list 
        // console.log('Navigation triggered'); // Log navigation trigger
      },
      error: error => {
        this.snackBarService.openSnackBar('Error Updating Class data:' + error.message, '',  []);
      }
    });
  }
  
  cancel(event: Event): void {
    this.router.navigate(['/app-class-list']); // Navigate to role-list 
  }
}
