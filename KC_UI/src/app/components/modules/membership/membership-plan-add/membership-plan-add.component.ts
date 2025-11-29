import { Component } from '@angular/core';
import { SnackbarService } from '../../../../services/snackbar.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembershipPlansService } from '../../../../services/membership-plans.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { BreadcrumbComponent } from '@app/components/shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-membership-plan-add',
    imports: [
        CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatCheckboxModule,
        MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatSelectModule,
        BreadcrumbComponent
    ],
  templateUrl: './membership-plan-add.component.html',
  styleUrls: []
})
export class MembershipPlanAddComponent {
  form: FormGroup;

  constructor(private router: Router, private membershipPlansService: MembershipPlansService,  private snackBarService: SnackbarService,) {}

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl({ value: '', disabled: false }, Validators.required),
      description: new FormControl({ value: '', disabled: false }, Validators.required),
      price: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.min(0.01)])
    });
  }

  get priceControl(): FormControl {
    return this.form.get('price') as FormControl;
  }

  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.form.get('description') as FormControl;
  }

  onSubmit(event: Event): void {
    event.preventDefault(); // Prevent the default form submission
  
    const planData = {
      planName: this.form.value.name,
      planDescription: this.form.value.description,
      planCost: this.form.value.price
    };
  
    // Call the addSkill method and pass the observer object
    this.membershipPlansService.addMembershipPlan(planData).subscribe({
      next: response => {
        this.router.navigate(['/app-membership-plan-list']); 
      },
      error: error => {
        this.snackBarService.openSnackBar('Error adding membership plan: ' + error.message, '', []);
      },
      complete: () => {
        // Optionally, handle completion
        console.log('Membership Plan addition complete');
      }
    });
  }
  

  cancel(event: Event): void {
    this.router.navigate(['/app-membership-plan-list']); 
  }
}
