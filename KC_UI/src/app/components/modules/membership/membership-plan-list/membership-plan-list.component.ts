import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { BreadcrumbComponent } from '@app/components/shared/breadcrumb/breadcrumb.component';
import { MembershipPlansService } from '@app/services/membership-plans.service';

@Component({
  selector: 'app-membership-plan-list',
  imports: [MatCardModule, MatPaginatorModule, MatMenuModule, MatTabsModule, 
    BreadcrumbComponent, MatTableModule],
  templateUrl: './membership-plan-list.component.html',
  styleUrl: './membership-plan-list.component.scss'
})
export class MembershipPlanListComponent {
  private membershipPlanArr: any[] = [];
  displayedColumns: string[] = ['name', 'description','cost'];
  dataSource = new MatTableDataSource(this.membershipPlanArr); 

  active = true;
  inactive = true;

  constructor(private membershipPlanService: MembershipPlansService, private router: Router) { }
  ngOnInit() {
    this.loadMembershipPlans();
  }

  loadMembershipPlans() {
    this.membershipPlanService.getMembershipPlans().subscribe((response) => {
      this.membershipPlanArr = response.data;
      this.dataSource = new MatTableDataSource(this.membershipPlanArr);
      console.log('Membership Plans loaded:', this.membershipPlanArr);
    }, (error) => {
      console.error('Error loading membership plans:', error);
    });
  }

  btnAddNewClick() {
     this.router.navigate(['/app-membership-plan-add']);
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
