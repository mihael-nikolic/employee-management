import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../interfaces/employee';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as _ from 'lodash';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  // employeesDataArray: Employee[] = [];
  employeesDataArray: any = [];
  dataSource = new MatTableDataSource<Employee>();
  columnsToDisplay = ['firstName', 'lastName', 'dateOfBirth', 'jobTitle'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.updateDataSource();
  }

  updateDataSource() {
    this.employeeService.getEmployees().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.employeesDataArray = response.data.map((employee: any) => ({
            ...employee,
            dateOfBirth: new Date(employee.dateOfBirth),
          }));
          this.dataSource = new MatTableDataSource<Employee>(
            this.employeesDataArray
          );
        } else {
          console.error('API response indicates failure');
        }
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = function (
          data,
          filter: string
        ): boolean {
          const fullName = `${data.firstName.toLowerCase()} ${data.lastName.toLowerCase()}`;
          return (
            data.firstName.toLowerCase().includes(filter) ||
            data.lastName.toLowerCase().includes(filter) ||
            fullName.includes(filter)
          );
        };

        console.log('Data loaded successfully');
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyJobPositionFilter($event: any) {
    var filteredData: any = [];
    if ($event.value === undefined) {
      this.dataSource = new MatTableDataSource(this.employeesDataArray);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } else {
      filteredData = _.filter(this.employeesDataArray, (item) => {
        return item.jobTitle.toLowerCase() == $event.value.toLowerCase();
      });
      this.dataSource = new MatTableDataSource(filteredData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
}
