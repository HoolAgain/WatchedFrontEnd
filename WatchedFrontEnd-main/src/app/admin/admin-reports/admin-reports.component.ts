import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css'],
  standalone: false
})
export class AdminReportsComponent implements OnInit, OnDestroy {
  adminLogs: any[] = [];
  siteActivity: any[] = [];
  selectedFilter: string = 'all';

  // Pagination properties
  readonly pageSize = 25;
  adminPageIndex = 0;
  siteActivityPageIndex = 0;
  activitySubscription: Subscription | null = null;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.getAdminLogs();
    this.getSiteActivity();
    this.activitySubscription = interval(30000).subscribe(() => {
      this.getSiteActivity();
    });
  }

  ngOnDestroy(): void {
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
    }
  }

  getAdminLogs(): void {
    this.adminService.getAdminLogs().subscribe({
      next: (data) => {
        // If data is wrapped in $values due to reference preservation, extract it.
        this.adminLogs = data && data.$values ? data.$values : data;
        this.adminPageIndex = 0; // reset to first page
      },
      error: (error) => {
        console.error('Error fetching admin logs:', error);
      }
    });
  }

  getSiteActivity(): void {
    this.adminService.getSiteActivity(this.selectedFilter).subscribe({
      next: (data) => {
        this.siteActivity = data && data.$values ? data.$values : data;
        this.siteActivityPageIndex = 0; // reset to first page
      },
      error: (error) => {
        console.error('Error fetching site activity:', error);
      }
    });
  }

  onFilterChange(): void {
    this.getSiteActivity();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  // Computed getters for paged data.
  get pagedAdminLogs(): any[] {
    const start = this.adminPageIndex * this.pageSize;
    return this.adminLogs.slice(start, start + this.pageSize);
  }

  get pagedSiteActivity(): any[] {
    const start = this.siteActivityPageIndex * this.pageSize;
    return this.siteActivity.slice(start, start + this.pageSize);
  }

  nextAdminPage(): void {
    if ((this.adminPageIndex + 1) * this.pageSize < this.adminLogs.length) {
      this.adminPageIndex++;
    }
  }

  prevAdminPage(): void {
    if (this.adminPageIndex > 0) {
      this.adminPageIndex--;
    }
  }

  nextSiteActivityPage(): void {
    if ((this.siteActivityPageIndex + 1) * this.pageSize < this.siteActivity.length) {
      this.siteActivityPageIndex++;
    }
  }

  prevSiteActivityPage(): void {
    if (this.siteActivityPageIndex > 0) {
      this.siteActivityPageIndex--;
    }
  }
}