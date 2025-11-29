import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { BreadcrumbComponent } from '@app/components/shared/breadcrumb/breadcrumb.component';
import { MembershipPlansService } from '@app/services/membership-plans.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-membership-plan-list',
  imports: [MatCardModule, MatPaginatorModule, MatMenuModule, MatTabsModule, 
    BreadcrumbComponent, MatTableModule, MatIconModule, CommonModule],
  templateUrl: './membership-plan-list.component.html',
  styleUrl: './membership-plan-list.component.scss'
})
export class MembershipPlanListComponent implements AfterViewInit {
  private membershipPlanArr: any[] = [];
  displayedColumns: string[] = ['planName', 'planDescription','planCost','action'];
  dataSource = new MatTableDataSource(this.membershipPlanArr); 

  active = true;
  inactive = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private membershipPlanService: MembershipPlansService, private router: Router) { }
  ngOnInit() {
    this.loadMembershipPlans();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadMembershipPlans() {
    this.membershipPlanService.getMembershipPlans().subscribe({
      next: (plans) => {
        // API returns raw array (no data wrapper)
        if (Array.isArray(plans)) {
          this.membershipPlanArr = plans;
        } else if (plans && typeof plans === 'object' && 'data' in plans) {
          // Fallback if backend later wraps in { data: [...] }
          this.membershipPlanArr = (plans as any).data;
        } else {
          this.membershipPlanArr = [];
        }
        console.log('Membership Plans loaded:', this.membershipPlanArr);
          this.dataSource = new MatTableDataSource(this.membershipPlanArr);
          this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error loading membership plans:', error);
        this.membershipPlanArr = [];
          this.dataSource = new MatTableDataSource(this.membershipPlanArr);
          this.dataSource.paginator = this.paginator;
      }
    });
  }

  btnAddNewClick() {
     this.router.navigate(['/app-membership-plan-add']);
  }

  editMembershipPlan(planId: number) {
    this.router.navigate(['/app-membership-plan-edit', planId]);
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
