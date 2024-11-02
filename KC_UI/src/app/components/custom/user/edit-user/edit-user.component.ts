import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../../services/user.service';
import { RoleService } from '../../../../services/role.service';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

interface Role {
  roleId: number;
  roleName: string;
  roleDescription: string;
  roleOrderId: number;
}

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatCheckboxModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatSelectModule
  ],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  form: FormGroup;
  userId: number;
  roleArr: Role[] = []; // Define the type of roleArr

  constructor(private fb: FormBuilder, private userService: UserService, private roleService: RoleService, 
              private commonService: CommonService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Get the userId from the route parameters
    this.route.params.subscribe(params => {
      this.userId = +params['userId']; // Assuming 'id' is the route parameter name
      this.loadUserData(this.userId);
      
    });

    this.form = this.fb.group({
      nameControl: ['', Validators.required],
      roleControl: [''],
      emailControl: ['', [Validators.required, Validators.email]],
      phoneControl: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      addressControl: [''],
      cityControl: [''],
      stateControl: [''],
      zipControl: [''],
      isActiveControl: [true]
    });

    this.form.get('cityControl')!.disable();
    this.form.get('stateControl')!.disable();
  }

  loadUserData(userId: number): void {
    this.userService.getUser(userId).subscribe({
      next: userResponse => {
        console.log('user', userResponse);
        this.form.patchValue({
          nameControl: userResponse.name,
          emailControl: userResponse.email,
          phoneControl: userResponse.phone,
          addressControl: userResponse.address,
          cityControl: userResponse.city,
          stateControl: userResponse.state,
          zipControl: userResponse.zip,
          isActiveControl: userResponse.isActive === 0,
        });
  
        // Set the imageSrc to the photoURL
        this.imageSrc = userResponse.photoURL;
  
        // Convert roleId string to an array
        const rolesArray = userResponse.roleId.split(',').map(Number);
  
        // Patch the roleControl with the user's roles
        this.form.get('roleControl')!.setValue(rolesArray);
  
        // Load roles after user data is patched
        this.roleService.getRoles().subscribe({
          next: roleResponse => {
            this.roleArr = roleResponse;
            // Ensure the roleControl value is still correct after loading roles
            this.form.get('roleControl')!.setValue(rolesArray);
            console.log('userResponse.roles', rolesArray);
          },
          error: error => {
            console.error('Error fetching role data:', error);
          }
        });
      },
      error: error => {
        console.error('Error fetching user data:', error);
        // Handle error here (e.g., show error message)
      }
    });
  }
  
  
  
  
  onSubmit(event: Event): void {
    event.preventDefault(); // Prevent the default form submission
    this.form.get('cityControl')!.enable();
    this.form.get('stateControl')!.enable();
    console.log('user form info', this.form.value); // Log the form values
  
    const accountId = localStorage.getItem('accountId'); // Retrieve accountId from local storage
    let userData = {
      accountId: accountId,
      name: this.form.value.nameControl,
      address: this.form.value.addressControl,
      city: this.form.value.cityControl,
      state: this.form.value.stateControl,
      zip: this.form.value.zipControl,
      phone: this.form.value.phoneControl,
      email: this.form.value.emailControl,
      isActive: this.form.value.isActiveControl ? 0 : 1,
      roleId: this.form.value.roleControl,
      resetPassword: false
    };
  
    const formData: FormData = new FormData();
    formData.append('userData', JSON.stringify(userData)); // Add user data
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile, this.selectedFile.name); // Add photo file if available
    }
  
    //console.log('formData:', formData); // Log the form data being sent to the server
    // Call the updateLocation method and pass the form data
    this.userService.updateUser(this.userId, formData).pipe(
      tap((response: any) => {
        console.log('User updated successfully:', response?.message);
        this.router.navigate(['/']); // Navigate to location-list
      }),
      catchError(error => {
        console.error('Error updating user:', error.message);
        return of(); // Return an observable to complete the stream
      })
    ).subscribe();
  }
  
  
  

  getCityStateInfo(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    const zipCodePattern = /^\d{5}$/;
  
    if (zipCodePattern.test(input)) {
      const zipCode = Number(input);
      this.commonService.getCityState(zipCode).subscribe({
        next: response => {
          console.log('City/State Info:', response); // Log the response to verify the data structure
          this.form.patchValue({
            cityControl: response.city,
            stateControl: response.state_code
          });
          console.log('Form values after setting city/state:', this.form.value); // Log form values after setting city/state
        },
        error: error => {
          console.error('Error fetching City/State Info:', error);
        }
      });
    }
  }
  

  cancel(event: Event): void {
    this.router.navigate(['/app-user-list']); // Navigate to location-list 
  }

  trackByRoleId(index: number, role: Role): number {
    return role.roleId;
  }

  imageSrc: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.selectedFile = file;
  
    // Optionally, set image preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSrc = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}
