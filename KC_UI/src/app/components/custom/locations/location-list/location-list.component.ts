import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink } from '@angular/router';

import { LocationService } from '../../../../services/location.service';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatMenuModule, MatButtonModule, MatPaginatorModule, MatTableModule, MatCheckboxModule, NgIf],
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.scss'
})
export class LocationListComponent implements OnInit, AfterViewInit {
  private locationArr: any[] = [];
  displayedColumns: string[] = ['Name', 'Address', 'Phone', 'Email', 'Action'];
  dataSource = new MatTableDataSource(this.locationArr);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private locationService: LocationService, private router: Router) {}

  ngOnInit(): void {
    this.locationService.getLocations().subscribe({
      next: response => {
        this.locationArr = response;
        this.dataSource.data = this.locationArr; // Update the dataSource here
      },
      error: error => {
        console.error('Error fetching locations:', error);
        // Handle login error here (e.g., show error message)
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  active = true;
  inactive = true;

  btnAddNewClick() {
    this.router.navigate(['/app-add-new-location']);
  }

  editLocation(locationId: number){
    this.router.navigate(['/app-edit-location', locationId]);
  }
}
