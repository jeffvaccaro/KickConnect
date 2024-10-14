import { Routes } from '@angular/router';
import { NotFoundComponent } from './components/common/not-found/not-found.component';

import { AuthenticationComponent } from './components/authentication/authentication.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { RegisterComponent } from './components/authentication/register/register.component';
import { LogoutComponent } from './components/authentication/logout/logout.component';
import { LockScreenComponent } from './components/authentication/lock-screen/lock-screen.component';
import { InternalErrorComponent } from './components/common/internal-error/internal-error.component';



import { OwnerComponent } from './components/dashboard/owner/owner/owner.component';
import { LocationListComponent } from './components/custom/locations/location-list/location-list.component';
import { AddNewLocationComponent } from './components/custom/locations/add-new-location/add-new-location.component';
import { EditLocationComponent } from './components/custom/locations/edit-location/edit-location.component';
import { UserListComponent } from './components/custom/user/user-list/user-list.component';
import { AddNewUserComponent } from './components/custom/user/add-new-user/add-new-user.component';
import { EditUserComponent } from './components/custom/user/edit-user/edit-user.component';
import { RoleListComponent } from './components/custom/roles/role-list/role-list.component';
import { AddNewRoleComponent } from './components/custom/roles/add-new-role/add-new-role.component';
import { EditRoleComponent } from './components/custom/roles/edit-role/edit-role.component';
import { ClassListComponent } from './components/custom/class/class-list/class-list.component';
import { AddNewClassComponent } from './components/custom/class/add-new-class/add-new-class.component';
import { EditClassComponent } from './components/custom/class/edit-class/edit-class.component';
import { SchedulerComponent } from './components/custom/scheduler/scheduler.component';
import { AddEditDialogComponent } from './components/custom/scheduler/add-edit-dialog/add-edit-dialog.component';

export const routes: Routes = [
    // { path: '', redirectTo: '/', pathMatch: 'full' },
    {path: '', component: OwnerComponent},
    {path: 'app-location-list', component: LocationListComponent },
    {path: 'app-add-new-location', component: AddNewLocationComponent },
    {path: 'app-edit-location/:locationId', component: EditLocationComponent },

    {path: 'app-user-list', component: UserListComponent },
    {path: 'app-add-new-user', component: AddNewUserComponent },
    {path: 'app-edit-user/:userId', component: EditUserComponent },

    {path: 'app-role-list', component: RoleListComponent },
    {path: 'app-add-new-role', component: AddNewRoleComponent },
    {path: 'app-edit-role/:roleId', component: EditRoleComponent },

    {path: 'app-class-list', component: ClassListComponent},
    {path: 'app-add-new-class', component: AddNewClassComponent},
    {path: 'app-edit-class/:classId', component: EditClassComponent },

    {path: 'app-scheduler', component: SchedulerComponent},
    {path: 'app-add-edit-dialog', component: AddEditDialogComponent},

     {
        path: 'authentication',
        component: AuthenticationComponent,
        children: [
            {path: '', component: LoginComponent},
            {path: 'register', component: RegisterComponent},
            {path: 'logout', component: LogoutComponent},
            //{path: 'forgot-password', component: ForgotPasswordComponent},
            //{path: 'reset-password', component: ResetPasswordComponent},
            //{path: 'signin-signup', component: SigninSignupComponent},
            // {path: 'confirm-mail', component: ConfirmMailComponent},
            // {path: 'lock-screen', component: LockScreenComponent}
        ]
    },
    { path: 'error', component: InternalErrorComponent },
    { path: 'error-500', component: InternalErrorComponent},
    // Here add new pages component

    {path: '**', component: NotFoundComponent} // This line will remain down from the whole pages component list
];