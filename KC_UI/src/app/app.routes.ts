import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';
import { NotFoundComponent } from './components/ui-modules/not-found/not-found.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { RegisterComponent } from './components/authentication/register/register.component';
import { LogoutComponent } from './components/authentication/logout/logout.component';
import { ResetPasswordComponent } from './components/authentication/reset-password/reset-password.component';
import { InternalErrorComponent } from './components/ui-modules/internal-error/internal-error.component';
import { DynamicComponent } from './components/ui-modules/dynamic/dynamic.component';
import { SuperAdminComponent } from './components/dashboard/super-admin/super-admin.component';
import { OwnerComponent } from './components/dashboard/owner/owner.component';
import { AdminComponent } from './components/dashboard/admin/admin.component';
import { StaffComponent } from './components/dashboard/staff/staff.component';
import { LocationListComponent } from './components/modules/locations/location-list/location-list.component';
import { AddNewLocationComponent } from './components/modules/locations/add-new-location/add-new-location.component';
import { EditLocationComponent } from './components/modules/locations/edit-location/edit-location.component';
import { AssignmentComponent } from './components/modules/locations/assignment/assignment.component';
import { StaffListComponent } from './components/modules/staff/staff-list/staff-list.component';
import { AddNewStaffComponent } from './components/modules/staff/add-new-staff/add-new-staff.component';
import { EditStaffComponent } from './components/modules/staff/edit-staff/edit-staff.component';
import { RoleListComponent } from './components/modules/roles/role-list/role-list.component';
import { AddNewRoleComponent } from './components/modules/roles/add-new-role/add-new-role.component';
import { EditRoleComponent } from './components/modules/roles/edit-role/edit-role.component';
import { EventListComponent } from './components/modules/event/event-list/event-list.component';
import { AddNewEventComponent } from './components/modules/event/add-new-event/add-new-event.component';
import { EditEventComponent } from './components/modules/event/edit-event/edit-event.component';
import { SchedulerComponent } from './components/modules/scheduler/scheduler.component';
import { AddEditDialogComponent } from './components/modules/scheduler/add-edit-dialog/add-edit-dialog.component';
import { ProfileListComponent } from './components/modules/profiles/profile-list/profile-list.component';
import { AddNewProfileComponent } from './components/modules/profiles/add-new-profile/add-new-profile.component';
import { EditProfileComponent } from './components/modules/profiles/edit-profile/edit-profile.component';
import { AccountListComponent } from './components/modules/accounts/account-list/account-list.component';
import { AddNewAccountComponent } from './components/modules/accounts/add-new-account/add-new-account.component';
import { AddNewSkillComponent } from './components/modules/skills/add-new-skill/add-new-skill.component';
import { EditSkillComponent } from './components/modules/skills/edit-skill/edit-skill.component';
import { SkillListComponent } from './components/modules/skills/skill-list/skill-list.component';
import { CreateHtmlTemplateComponent } from './components/html-generator/create-html-template/create-html-template.component';
import { StepperComponent } from './components/html-generator/create-html-template/html-template-step/stepper/stepper.component';
import { SkillsAutocompleteComponent } from './components/modules/staff/skills-autocomplete/skills-autocomplete.component';
import { AttendanceDisplayComponent } from './components/modules/attendance-display/attendance-display.component';
import { MemberAddComponent } from './components/modules/membership/member-add/member-add.component';
import { MemberEditComponent } from './components/modules/membership/member-edit/member-edit.component';
import { MemberListComponent } from './components/modules/membership/member-list/member-list.component';
import { MembershipPlanAddComponent } from './components/modules/membership/membership-plan-add/membership-plan-add.component';
import { MembershipPlanEditComponent } from './components/modules/membership/membership-plan-edit/membership-plan-edit.component';
import { MembershipPlanListComponent } from './components/modules/membership/membership-plan-list/membership-plan-list.component';


const authRoutes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
];

const mainRoutes: Routes = [
  {
    path: 'dashboard',
    component: DynamicComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['Owner', 'Super Admin', 'Admin', 'Staff'] }
  },  
  {
    path: 'owner',
    component: OwnerComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['Owner'] }
  },
  {
    path: 'super-admin',
    component: SuperAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['Super Admin'] }
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['Admin'] }
  },
  {
    path: 'staff',
    component: StaffComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['Staff'] }
  },
  
  {
    path: 'not-authorized',
    component: AuthenticationComponent
  },

  { path: 'app-location-list', component: LocationListComponent, canActivate: [AuthGuard] },
  { path: 'app-add-new-location', component: AddNewLocationComponent, canActivate: [AuthGuard] },
  { path: 'app-edit-location/:locationId', component: EditLocationComponent, canActivate: [AuthGuard] },

  { path: 'app-assignments/:locationId', component: AssignmentComponent, canActivate: [AuthGuard]},
  
  { path: 'app-staff-list', component: StaffListComponent, canActivate: [AuthGuard] },
  { path: 'app-edit-staff/:userId', component: EditStaffComponent, canActivate: [AuthGuard] },

  { path: 'app-add-new-account', component: AddNewAccountComponent, canActivate: [AuthGuard] },
  { path: 'app-account-list', component: AccountListComponent, canActivate: [AuthGuard] },

  { path: 'app-add-new-user', component: AddNewStaffComponent, canActivate: [AuthGuard] },
  
  { path: 'app-role-list', component: RoleListComponent, canActivate: [AuthGuard] },
  { path: 'app-add-new-role', component: AddNewRoleComponent, canActivate: [AuthGuard] },
  { path: 'app-edit-role/:roleId', component: EditRoleComponent, canActivate: [AuthGuard] },
  
  { path: 'app-event-list', component: EventListComponent, canActivate: [AuthGuard] },
  { path: 'app-add-new-event', component: AddNewEventComponent, canActivate: [AuthGuard] },
  { path: 'app-edit-event/:eventId', component: EditEventComponent, canActivate: [AuthGuard] },
  
  { path: 'app-scheduler', component: SchedulerComponent, canActivate: [AuthGuard] },
  { path: 'app-add-edit-dialog', component: AddEditDialogComponent, canActivate: [AuthGuard] },
  
  { path: 'app-profile-list', component: ProfileListComponent, canActivate: [AuthGuard] },
  { path: 'app-add-new-profile', component: AddNewProfileComponent, canActivate: [AuthGuard] },
  { path: 'app-edit-profile/:userId', component: EditProfileComponent, canActivate: [AuthGuard] },
  
  { path: 'app-add-new-skill', component: AddNewSkillComponent, canActivate: [AuthGuard]},
  { path: 'app-edit-skill/:skillId', component: EditSkillComponent, canActivate: [AuthGuard]},
  { path: 'app-skill-list', component: SkillListComponent, canActivate: [AuthGuard]},
  {path: 'app-skills-autocomplete', component: SkillsAutocompleteComponent},

  { path: 'app-create-html-template', component: CreateHtmlTemplateComponent },
  { path: 'app-stepper', component:StepperComponent},
  { path: 'app-class-login', component:AttendanceDisplayComponent},

  { path: 'app-add-member', component: MemberAddComponent, canActivate: [AuthGuard]},
  { path: 'app-edit-member', component: MemberEditComponent, canActivate: [AuthGuard]},
  { path: 'app-member-list', component: MemberListComponent, canActivate: [AuthGuard]},

  { path: 'app-membership-plan-add', component: MembershipPlanAddComponent, canActivate: [AuthGuard] },
  { path: 'app-membership-plan-edit/:planId', component: MembershipPlanEditComponent, canActivate: [AuthGuard] },
  { path: 'app-membership-plan-list', component: MembershipPlanListComponent, canActivate: [AuthGuard] },

  { path: 'error', component: InternalErrorComponent },
  { path: 'error-500', component: InternalErrorComponent },
  { path: '**', component: NotFoundComponent }
];

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full' // Ensure redirection only happens for the exact empty path
  },
  {
    path: '',
    component: AuthenticationComponent,
    children: authRoutes
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: mainRoutes
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

