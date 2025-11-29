import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { BreadcrumbComponent } from '@app/components/shared/breadcrumb/breadcrumb.component';
import { MembershipService } from '@app/services/membership.service';


@Component({
  selector: 'app-member-list',
  imports: [MatCardModule, MatPaginatorModule, MatMenuModule, MatMenu, MatTabsModule, 
    BreadcrumbComponent, MatTableModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent {
  private memberArr: any[] = [];
  displayedColumns: string[] = ['name', 'roleName','phone','action'];
  dataSource = new MatTableDataSource(this.memberArr); 

  active = true;
  inactive = true;

  constructor(private membershipService: MembershipService, private router: Router) { }
  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.membershipService.getMembers().subscribe((response) => {
      this.memberArr = response.data;
      this.dataSource = new MatTableDataSource(this.memberArr);
      console.log('Members loaded:', this.memberArr);
    }, (error) => {
      console.error('Error loading members:', error);
    });
  }

  btnAddNewClick() {
     this.router.navigate(['/app-add-member']);
  }

  editMember(memberId: number) {

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
      default:
        status = 'Active';
    }
  }
}
