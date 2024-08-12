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

    console.log(this.newEmployee);
    this.employeeForm.reset();
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
