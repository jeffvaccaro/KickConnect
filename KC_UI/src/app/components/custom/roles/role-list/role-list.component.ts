import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserService } from '../../../../services/user.service';
import { RoleService } from '../../../../services/role.service';

import { SnackbarService } from '../../../../services/snackbar.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatMenuModule, MatButtonModule, MatPaginatorModule, MatTableModule, MatCheckboxModule,MatTabsModule, NgIf],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent implements OnInit, AfterViewInit {
  private roleArr: any[] = [];
  accountCode: string;
  accountId: number;
  displayedColumns: string[] = ['roleName','roleDescription','action'];
  dataSource = new MatTableDataSource(this.roleArr);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private roleService: RoleService, private snackBarService: SnackbarService, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {

    this.roleService.getRoles().subscribe({
      next: response => {
        this.roleArr = response;
        this.dataSource.data = this.roleArr; // Update the dataSource here
        // console.log(this.roleArr);
      },
      error: error => {
        this.snackBarService.openSnackBar('Error fetching Roles:' + error.message, '',  []);
      }
    });    
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  btnAddNewClick() {
    this.router.navigate(['/app-add-new-role']);
  }

  editRole(roleId: number){
    this.router.navigate(['/app-edit-role', roleId]);
  }
  filterLocations(){
    this.router.navigate(['/app-role-list']);

  }
}



