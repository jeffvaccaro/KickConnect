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
import { ClassService } from '../../../../services/class.service';
import { SnackbarService } from '../../../../services/snackbar.service';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatMenuModule, MatButtonModule, MatPaginatorModule, MatTableModule, MatCheckboxModule,MatTabsModule, NgIf],
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss'
})
export class ClassListComponent implements OnInit, AfterViewInit {
  private classArr: any[] = [];
  accountCode: string;
  accountId: number;
  displayedColumns: string[] = ['Name', 'Description','Action'];
  dataSource = new MatTableDataSource(this.classArr);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private classService: ClassService, private userService: UserService, private router: Router,
              private route: ActivatedRoute, private cdr: ChangeDetectorRef, 
              private snackbarService: SnackbarService) {}

  ngOnInit(): void {
    this.userService.getAccountCode().subscribe(accountCode => {
      this.accountCode = accountCode;
      this.cdr.detectChanges();
    });

    this.userService.getAccountId().subscribe(accountId => {
      this.accountId = Number(accountId);
      this.cdr.detectChanges;
    })
    this.getClassList(this.accountId);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  active = true;
  inactive = true;

  getClassList(accountId: number, status = 'Active'): void {
    this.classService.getClasses(accountId).subscribe({
      next: response => {
        this.classArr = response;
        this.dataSource.data = status === 'All' ? this.classArr : this.classArr.filter(item => item.isActive === (status === 'Active' ? 1 : 0));
      },
      error: error => {
        this.snackbarService.openSnackBar('Error fetching Class data!','',[]);
      }
    });
  }

  onTabChange(event: MatTabChangeEvent): void {
    let status: string;
    switch (event.index) {
      case 0:
        status = 'Active';
        break;
      case 1:
        status = 'InActive';
        break;
      case 2:
        status = 'All';
        break;
      default:
        status = 'Active';
    }
    this.getClassList(this.accountId, status);
  }

  btnAddNewClick() {
    this.router.navigate(['/app-add-new-class']);
  }

  editClass(classId: number){
    this.router.navigate(['/app-edit-class', classId]);
  }

  deleteClass(classId: number){
    this.classService.deactivateClass(this.accountId,classId).subscribe({
      next: response => {
        this.getClassList(this.accountId);
      },
      error: error => {
        this.snackbarService.openSnackBar('Error Deleting the Class!','',[]);
      }
    });


    
  }

  filterLocations(){
    //this.router.navigate(['/app-location-list'], { queryParams: { status: 'InActive' } });

  }
}
