import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { SkillsAutocompleteComponent } from '../skills-autocomplete/skills-autocomplete.component';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    SkillsAutocompleteComponent
  ],
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss']
})
export class ProfileModalComponent {
  profileForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ProfileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, private userService: UserService, private cdr: ChangeDetectorRef
  ) {
    //console.log(this.data,'profile data');

    this.profileForm = this.fb.group({
      profileDescription: [this.data?.profileDescription || '', Validators.required],
      profileURL: [this.data?.profileURL || '', Validators.required],
      profileSkills: this.fb.array([])
    });
    this.onSkillsChanged(this.data?.profileSkills || []);
  }

  onSkillsChanged(skills: string | string[]): void { 
    const skillsArray = this.profileForm.get('profileSkills') as FormArray;
    skillsArray.clear();
  
    if (typeof skills === 'string') {
      skills = skills.split(',').map(skill => skill.trim()); // Split the string into an array
    }
  
    if (Array.isArray(skills)) {
      skills.forEach(skill => skillsArray.push(this.fb.control(skill)));
    }    
    //console.log(this.profileForm,'profile form');
  }
  

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.profileForm.valid) {
      const formData: FormData = new FormData();
      formData.append('profileData', JSON.stringify(this.profileForm.value));

      this.userService.updateProfile(this.data.userId, formData).subscribe({
        next: (response) => {
          console.log('Response from server:', response);
        },
        error: (error) => {
          console.error('Error:', error);
        },
        complete: () => {
          console.log('Update profile request completed');
        }
      });

      this.dialogRef.close(this.profileForm.value);
    }
  }
}
