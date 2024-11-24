import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { SkillsAutocompleteComponent } from '../skills-autocomplete/skills-autocomplete.component';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [ReactiveFormsModule,
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
  styleUrl: './profile-modal.component.scss'
})
export class ProfileModalComponent {
  profileForm: FormGroup;
  skillsArr: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ProfileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, private userService : UserService
  ) {
    console.log(this.data.userId);
    this.profileForm = this.fb.group({
      profileDescription: ['', Validators.required],
      profileURL: ['', Validators.required],
      profileSkills: ['']
    });
  }

  onSkillsChanged(skills: string[]): void { 
    console.log(skills);
    this.profileForm.patchValue({ skills });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.profileForm.valid) {
      console.log('userService call');
      this.userService.updateProfile(this.data.userId,this.profileForm.value)
      this.dialogRef.close(this.profileForm.value);
    }
  }
}
