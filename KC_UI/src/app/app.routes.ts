import { Routes } from '@angular/router';
import { AuthGuard } from './guards/AuthGuard';
import { NotFoundComponent } from './components/common/not-found/not-found.component';

import { AuthenticationComponent } from './components/authentication/authentication.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { RegisterComponent } from './components/authentication/register/register.component';
import { LogoutComponent } from './components/authentication/logout/logout.component';
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
import { EventListComponent } from './components/custom/event/event-list/event-list.component';
import { AddNewEventComponent } from './components/custom/event/add-new-event/add-new-event.component';
import { EditEventComponent } from './components/custom/event/edit-event/edit-event.component';
import { SchedulerComponent } from './components/custom/scheduler/scheduler.component';
import { AddEditDialogComponent } from './components/custom/scheduler/add-edit-dialog/add-edit-dialog.component';

export const routes: Routes = [
    { path: '', component: OwnerComponent, canActivate: [AuthGuard] },
    { path: 'app-location-list', component: LocationListComponent, canActivate: [AuthGuard] },
    { path: 'app-add-new-location', component: AddNewLocationComponent, canActivate: [AuthGuard] },
    { path: 'app-edit-location/:locationId', component: EditLocationComponent, canActivate: [AuthGuard] },
    { path: 'app-user-list', component: UserListComponent, canActivate: [AuthGuard] },
    { path: 'app-add-new-user', component: AddNewUserComponent, canActivate: [AuthGuard] },
    { path: 'app-edit-user/:userId', component: EditUserComponent, canActivate: [AuthGuard] },
    { path: 'app-role-list', component: RoleListComponent, canActivate: [AuthGuard] },
    { path: 'app-add-new-role', component: AddNewRoleComponent, canActivate: [AuthGuard] },
    { path: 'app-edit-role/:roleId', component: EditRoleComponent, canActivate: [AuthGuard] },
    { path: 'app-event-list', component: EventListComponent, canActivate: [AuthGuard] },
    { path: 'app-add-new-event', component: AddNewEventComponent, canActivate: [AuthGuard] },
    { path: 'app-edit-event/:eventId', component: EditEventComponent, canActivate: [AuthGuard] },
    { path: 'app-scheduler', component: SchedulerComponent, canActivate: [AuthGuard] },
    { path: 'app-add-edit-dialog', component: AddEditDialogComponent, canActivate: [AuthGuard] },
    {
      path: 'authentication',
      component: AuthenticationComponent,
      children: [
        { path: '', component: LoginComponent },
        { path: 'register', component: RegisterComponent },
        { path: 'logout', component: LogoutComponent },
      ]
    },
    { path: 'error', component: InternalErrorComponent },
    { path: 'error-500', component: InternalErrorComponent },
    { path: '**', component: NotFoundComponent}
];