import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdminReportsComponent } from './admin-reports.component';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('AdminReportsComponent', () => {
  let component: AdminReportsComponent;
  let fixture: ComponentFixture<AdminReportsComponent>;
  let mockAdminService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAdminService = {
      getAdminLogs: jasmine.createSpy().and.returnValue(of([{ createdAt: new Date(), adminName: 'Admin1', action: 'Edited', targetPostTitle: 'Post Title' }])),
      getSiteActivity: jasmine.createSpy().and.returnValue(of([{ activity: 'Post', operation: 'Create', timeOf: new Date(), username: 'User1' }]))
    };

    mockRouter = {
      navigate: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      declarations: [AdminReportsComponent],
      imports: [FormsModule],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch admin logs on init', () => {
    expect(mockAdminService.getAdminLogs).toHaveBeenCalled();
    expect(component.adminLogs.length).toBeGreaterThan(0);
  });

  it('should fetch site activity on init', () => {
    expect(mockAdminService.getSiteActivity).toHaveBeenCalledWith('all');
    expect(component.siteActivity.length).toBeGreaterThan(0);
  });

  it('should call goHome and navigate to root', () => {
    component.goHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle filter change and refetch site activity', () => {
    component.selectedFilter = 'past-month';
    component.onFilterChange();
    expect(mockAdminService.getSiteActivity).toHaveBeenCalledWith('past-month');
  });

  it('should paginate admin logs correctly', () => {
    component.adminLogs = Array(30).fill({ createdAt: new Date(), adminName: 'Admin', action: 'Test' });
    component.adminPageIndex = 1;
    const paged = component.pagedAdminLogs;
    expect(paged.length).toBe(5); // 30 total, page 2 of 25 => only 5 left
  });

  it('should paginate site activity correctly', () => {
    component.siteActivity = Array(30).fill({ activity: 'Test', operation: 'Op', timeOf: new Date(), username: 'User' });
    component.siteActivityPageIndex = 1;
    const paged = component.pagedSiteActivity;
    expect(paged.length).toBe(5);
  });

  it('should increase admin page index on nextAdminPage()', () => {
    component.adminLogs = Array(50);
    component.adminPageIndex = 0;
    component.nextAdminPage();
    expect(component.adminPageIndex).toBe(1);
  });

  it('should decrease admin page index on prevAdminPage()', () => {
    component.adminPageIndex = 1;
    component.prevAdminPage();
    expect(component.adminPageIndex).toBe(0);
  });

  it('should increase site activity page index on nextSiteActivityPage()', () => {
    component.siteActivity = Array(50);
    component.siteActivityPageIndex = 0;
    component.nextSiteActivityPage();
    expect(component.siteActivityPageIndex).toBe(1);
  });

  it('should decrease site activity page index on prevSiteActivityPage()', () => {
    component.siteActivityPageIndex = 1;
    component.prevSiteActivityPage();
    expect(component.siteActivityPageIndex).toBe(0);
  });

  it('should handle error on getAdminLogs()', () => {
    mockAdminService.getAdminLogs.and.returnValue(throwError(() => new Error('Failed')));
  
    // fresh component instance without triggering ngOnInit
    fixture = TestBed.createComponent(AdminReportsComponent);
    component = fixture.componentInstance;
  
    component.getAdminLogs(); // call manually
    expect(component.adminLogs.length).toBe(0);
  });
  
  it('should handle error on getSiteActivity()', () => {
    mockAdminService.getSiteActivity.and.returnValue(throwError(() => new Error('Failed')));
  
    fixture = TestBed.createComponent(AdminReportsComponent);
    component = fixture.componentInstance;
  
    component.getSiteActivity(); // call manually
    expect(component.siteActivity.length).toBe(0);
  });
  
  

});
