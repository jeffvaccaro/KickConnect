import { NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-team-members-list',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatMenuModule, MatButtonModule, MatPaginatorModule, MatTableModule, NgIf],
    templateUrl: './team-members-list.component.html',
    styleUrls: ['./team-members-list.component.scss']
})
export class TeamMembersListComponent {

    displayedColumns: string[] = ['user', 'email', 'role', 'status'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

    @ViewChild(MatPaginator) paginator: MatPaginator;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    active = true;
    inactive = true;

}

export interface PeriodicElement {
    email: string;
    role: any;
    user: any;
    status: any;
}

const ELEMENT_DATA: PeriodicElement[] = [
    {
        user: {
            userName: 'Lucile Young',
            userImage: 'img/user/user8.jpg',
            userDesignation: '@lyoung4a',
        },
        email: 'lyoung4a@kickConnect.com',
        role: {
            icon: 'img/icon/editor.png',
            roleTitle: 'Editor'
        },
        status: {
            active: 'Active'
        }
    },
    {
        user: {
            userName: 'Jordan Stevenson',
            userImage: 'img/user/user9.jpg',
            userDesignation: '@jstevenson5c',
        },
        email: 'jstevenson5c@kickConnect.com',
        role: {
            icon: 'img/icon/admin.png',
            roleTitle: 'Admin'
        },
        status: {
            inactive: 'Inactive'
        }
    },
    {
        user: {
            userName: 'Francis Frank',
            userImage: 'img/user/user10.jpg',
            userDesignation: '@ffrank7e',
        },
        email: 'ffrank7e@kickConnect.com',
        role: {
            icon: 'img/icon/maintainer.png',
            roleTitle: 'Maintainer'
        },
        status: {
            active: 'Active'
        }
    },
    {
        user: {
            userName: 'Phoebe Patterson',
            userImage: 'img/user/user11.jpg',
            userDesignation: '@ppatterson2g',
        },
        email: 'ppatterson2g@kickConnect.com',
        role: {
            icon: 'img/icon/author.png',
            roleTitle: 'Author'
        },
        status: {
            active: 'Active'
        }
    },
    {
        user: {
            userName: 'James Andy',
            userImage: 'img/user/user1.jpg',
            userDesignation: '@andyjm32',
        },
        email: 'andyjm32@kickConnect.com',
        role: {
            icon: 'img/icon/admin.png',
            roleTitle: 'Admin'
        },
        status: {
            inactive: 'Inactive'
        }
    },
    {
        user: {
            userName: 'Sarah Taylor',
            userImage: 'img/user/user2.jpg',
            userDesignation: '@taylors32',
        },
        email: 'taylors32@kickConnect.com',
        role: {
            icon: 'img/icon/editor.png',
            roleTitle: 'Editor'
        },
        status: {
            active: 'Active'
        }
    },
    {
        user: {
            userName: 'David Warner',
            userImage: 'img/user/user3.jpg',
            userDesignation: '@davidwabc2',
        },
        email: 'davidwabc2@kickConnect.com',
        role: {
            icon: 'img/icon/author.png',
            roleTitle: 'Author'
        },
        status: {
            active: 'Active'
        }
    },
    {
        user: {
            userName: 'Steven Smith',
            userImage: 'img/user/user4.jpg',
            userDesignation: '@ssmith542',
        },
        email: 'ssmith542@kickConnect.com',
        role: {
            icon: 'img/icon/maintainer.png',
            roleTitle: 'Maintainer'
        },
        status: {
            active: 'Active'
        }
    },
];