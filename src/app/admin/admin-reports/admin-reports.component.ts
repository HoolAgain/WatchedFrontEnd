import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css'],
  standalone: false
})
export class AdminReportsComponent implements OnInit {
  adminLogs: any[] = [];

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.getAdminLogs();
  }

  getAdminLogs(): void {
    this.adminService.getAdminLogs().subscribe({
      next: (data) => {
        console.log("Admin logs data:", data);
        // If data contains a $values property, assign that array; otherwise, assign data directly.
        this.adminLogs = data && data.$values ? data.$values : data;
      },
      error: (error) => {
        console.error('Error fetching admin logs:', error);
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
