import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-profile-list',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatButtonModule, MatMenuModule, MatTableModule, MatCheckboxModule, NgIf, MatPaginatorModule, MatTabsModule],
    templateUrl: 'profile-list.component.html',
    styleUrls: []
})
export class ProfileListComponent {


    constructor(
        public dialog: MatDialog, private router: Router
    ) {}

    



    // openCreateUserDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    //     this.dialog.open(CreateUserDialogBox, {
    //         width: '600px',
    //         enterAnimationDuration,
    //         exitAnimationDuration
    //     });
    // }

}

// export interface PeriodicElement {
//     email: string;
//     role: string;
//     projects: string;
//     user: any;
//     action: string;
//     status: any;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//     {
//         user: {
//             userName: 'Lucile Young',
//             userImage: 'public/img/user/user8.jpg',
//             userDesignation: '@lyoung4a',
//         },
//         email: 'lyoung4a@tagus.com',
//         role: 'Editor',
//         status: {
//             active: 'Active'
//         },
//         projects: '165',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Jordan Stevenson',
//             userImage: 'public/img/user/user9.jpg',
//             userDesignation: '@jstevenson5c',
//         },
//         email: 'jstevenson5c@tagus.com',
//         role: 'Admin',
//         status: {
//             inactive: 'Inactive'
//         },
//         projects: '99',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Francis Frank',
//             userImage: 'public/img/user/user10.jpg',
//             userDesignation: '@ffrank7e',
//         },
//         email: 'ffrank7e@tagus.com',
//         role: 'Maintainer',
//         status: {
//             active: 'Active'
//         },
//         projects: '75',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Phoebe Patterson',
//             userImage: 'public/img/user/user11.jpg',
//             userDesignation: '@ppatterson2g',
//         },
//         email: 'ppatterson2g@tagus.com',
//         role: 'Author',
//         status: {
//             active: 'Active'
//         },
//         projects: '100',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'James Andy',
//             userImage: 'public/img/user/user1.jpg',
//             userDesignation: '@andyjm32',
//         },
//         email: 'andyjm32@tagus.com',
//         role: 'Admin',
//         status: {
//             inactive: 'Inactive'
//         },
//         projects: '32',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Sarah Taylor',
//             userImage: 'public/img/user/user2.jpg',
//             userDesignation: '@taylors32',
//         },
//         email: 'taylors32@tagus.com',
//         role: 'Editor',
//         status: {
//             active: 'Active'
//         },
//         projects: '145',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'David Warner',
//             userImage: 'public/img/user/user3.jpg',
//             userDesignation: '@davidwabc2',
//         },
//         email: 'davidwabc2@tagus.com',
//         role: 'Author',
//         status: {
//             active: 'Active'
//         },
//         projects: '111',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Steven Smith',
//             userImage: 'public/img/user/user4.jpg',
//             userDesignation: '@ssmith542',
//         },
//         email: 'ssmith542@tagus.com',
//         role: 'Maintainer',
//         status: {
//             active: 'Active'
//         },
//         projects: '18',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Lucile Young',
//             userImage: 'public/img/user/user8.jpg',
//             userDesignation: '@lyoung4a',
//         },
//         email: 'lyoung4a@tagus.com',
//         role: 'Editor',
//         status: {
//             active: 'Active'
//         },
//         projects: '165',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Jordan Stevenson',
//             userImage: 'public/img/user/user9.jpg',
//             userDesignation: '@jstevenson5c',
//         },
//         email: 'jstevenson5c@tagus.com',
//         role: 'Admin',
//         status: {
//             inactive: 'Inactive'
//         },
//         projects: '99',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Francis Frank',
//             userImage: 'public/img/user/user10.jpg',
//             userDesignation: '@ffrank7e',
//         },
//         email: 'ffrank7e@tagus.com',
//         role: 'Maintainer',
//         status: {
//             active: 'Active'
//         },
//         projects: '75',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Phoebe Patterson',
//             userImage: 'public/img/user/user11.jpg',
//             userDesignation: '@ppatterson2g',
//         },
//         email: 'ppatterson2g@tagus.com',
//         role: 'Author',
//         status: {
//             active: 'Active'
//         },
//         projects: '100',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'James Andy',
//             userImage: 'public/img/user/user1.jpg',
//             userDesignation: '@andyjm32',
//         },
//         email: 'andyjm32@tagus.com',
//         role: 'Admin',
//         status: {
//             inactive: 'Inactive'
//         },
//         projects: '32',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Sarah Taylor',
//             userImage: 'public/img/user/user2.jpg',
//             userDesignation: '@taylors32',
//         },
//         email: 'taylors32@tagus.com',
//         role: 'Editor',
//         status: {
//             active: 'Active'
//         },
//         projects: '145',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'David Warner',
//             userImage: 'public/img/user/user3.jpg',
//             userDesignation: '@davidwabc2',
//         },
//         email: 'davidwabc2@tagus.com',
//         role: 'Author',
//         status: {
//             active: 'Active'
//         },
//         projects: '111',
//         action: 'ri-more-fill'
//     },
//     {
//         user: {
//             userName: 'Steven Smith',
//             userImage: 'public/img/user/user4.jpg',
//             userDesignation: '@ssmith542',
//         },
//         email: 'ssmith542@tagus.com',
//         role: 'Maintainer',
//         status: {
//             active: 'Active'
//         },
//         projects: '18',
//         action: 'ri-more-fill'
//     },
// ];

// @Component({
//     selector: 'create-user-dialog:not(x)',
//     templateUrl: './create-user-dialog.html',
// })
// export class CreateUserDialogBox {

//     constructor(
//         public dialogRef: MatDialogRef<CreateUserDialogBox>
//     ) {}

//     close(){
//         this.dialogRef.close(true);
//     }

// }