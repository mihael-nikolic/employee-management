import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../interfaces/employee';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
})
export class EmployeeFormComponent {
  constructor(private employeeService: EmployeeService) {}
  newEmployee!: Employee;

  employeeForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    dateOfBirth: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
    ]),
    jobTitle: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
    ]),
  });

  onSubmit() {
    this.newEmployee = {
      id: 0,
      firstName: this.employeeForm.controls['firstName'].value as string,
      lastName: this.employeeForm.controls['lastName'].value as string,
      dateOfBirth: this.employeeForm.controls['dateOfBirth']
        .value as unknown as Date,
      jobTitle: this.employeeForm.controls['jobTitle'].value as string,
    };

    // Try to create employee via service. Service will emit updated list
    // (falls back to local list if POST fails).
    this.employeeService.createEmployee(this.newEmployee).subscribe({
      next: (res: any) => {
        // success — service already updated employees$ stream
        this.employeeForm.reset();
      },
      error: (err: any) => {
        console.error('Failed to create employee', err);
        // still reset form to allow new input
        this.employeeForm.reset();
      },
    });
  }

  onCancel() {
    this.employeeForm.reset();
  }

  //   constructor(private fb: FormBuilder) {
  //     this.employeeForm = this.fb.group({
  //       firstName: ['', Validators.required],
  //       lastName: ['', Validators.required],
  //       dateOfBirth: ['', Validators.required],
  //       position: ['', Validators.required],
  //     });
  //   }

  //   saveEmployee(): void {
  //     if (this.employeeForm.valid) {
  //       console.log(this.employeeForm.value);
  //     } else {
  //       console.error('Forma nije ispravna');
  //     }
  //   }
  // }
}
