import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Employee } from '../interfaces/employee';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  private readonly url =
    'https://api.test.ulaznice.hr/paganini/api/job-interview/employees';

  // Dummy fallback data used when the GET fails
  private readonly DUMMY_EMPLOYEES: Employee[] = [
    {
      id: 1,
      firstName: 'Ana',
      lastName: 'Kovač',
      dateOfBirth: new Date('1988-03-12'),
      jobTitle: 'Programer',
    },
    {
      id: 2,
      firstName: 'Marko',
      lastName: 'Horvat',
      dateOfBirth: new Date('1990-07-05'),
      jobTitle: 'Analitičar',
    },
    {
      id: 3,
      firstName: 'Ivana',
      lastName: 'Babić',
      dateOfBirth: new Date('1985-11-21'),
      jobTitle: 'Dizajner',
    },
    {
      id: 4,
      firstName: 'Petar',
      lastName: 'Vučić',
      dateOfBirth: new Date('1992-01-30'),
      jobTitle: 'Konzultant',
    },
    {
      id: 5,
      firstName: 'Lana',
      lastName: 'Matić',
      dateOfBirth: new Date('1995-09-14'),
      jobTitle: 'Manager',
    },
  ];

  /**
   * Fetch employees from API and normalize the response to { success, data }.
   * The consumer (`employee-list.component.ts`) expects an object with
   * `{ success, data }`. If the API fails or returns an array directly,
   * normalize to that shape and fall back to `DUMMY_EMPLOYEES` on error.
   */
  getEmployees(): Observable<{ success: boolean; data: Employee[] }> {
    return this.http.get<{ success: boolean; data: Employee[] }>(this.url).pipe(
      map((res: any) => {
        if (Array.isArray(res)) {
          return { success: true, data: res };
        }
        if (res && typeof res === 'object') {
          if ('success' in res && 'data' in res) {
            return res;
          }
          // If API returns { data: [...] } without `success`
          if ('data' in res && Array.isArray(res.data)) {
            return { success: true, data: res.data };
          }
        }
        // Unknown shape — return empty success payload
        return { success: true, data: [] };
      }),
      catchError((err) => {
        console.error('Failed to fetch employees, returning dummy data', err);
        return of({ success: true, data: this.DUMMY_EMPLOYEES });
      })
    );
  }

  // BehaviorSubject holding the current list of employees. Initialize with dummy data.
  private employeesSubject = new BehaviorSubject<Employee[]>(
    this.DUMMY_EMPLOYEES
  );
  public employees$ = this.employeesSubject.asObservable();

  // In-memory additions made when POST fails. These are merged into emitted lists
  // so that created items remain visible even if the API is unreachable.
  private pendingAdds: Employee[] = [];

  /** Load employees from API and push into `employees$` stream. */
  loadEmployees(): void {
    this.getEmployees()
      .pipe(
        tap((res: any) => {
          if (res && res.success && Array.isArray(res.data)) {
            // convert date strings to Date objects when necessary
            const normalized = res.data.map((e: any) => ({
              ...e,
              dateOfBirth: e.dateOfBirth
                ? new Date(e.dateOfBirth)
                : e.dateOfBirth,
            }));
            // Merge any locally added employees (avoid duplicate ids)
            const merged = [
              ...normalized,
              ...this.pendingAdds.filter(
                (p) => !normalized.some((n: Employee) => n.id === p.id)
              ),
            ];
            this.employeesSubject.next(merged);
          } else {
            // Merge pendingAdds with dummy data so local creations stay visible
            const merged = [
              ...this.DUMMY_EMPLOYEES,
              ...this.pendingAdds.filter(
                (p) => !this.DUMMY_EMPLOYEES.some((d) => d.id === p.id)
              ),
            ];
            this.employeesSubject.next(merged);
          }
        }),
        catchError((err) => {
          // If load fails, still emit dummy employees
          this.employeesSubject.next(this.DUMMY_EMPLOYEES);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Create an employee. Attempts to POST to API; on failure, falls back to
   * adding to the in-memory list and emits updated list via `employees$`.
   */
  createEmployee(emp: Employee): Observable<any> {
    // Attempt to POST to the API; if it fails, update local list.
    return this.http.post<any>(this.url, emp).pipe(
      tap((res: any) => {
        // If API returns the created employee or returns success/data, refresh
        // local stream by reloading from API (best-effort).
        this.loadEmployees();
      }),
      catchError((err) => {
        console.error('Failed to POST employee, adding to local list', err);
        // fallback: add to pendingAdds and emit merged list
        const current = this.employeesSubject.getValue() || [];
        const maxId = current.reduce(
          (m: number, it: Employee) => (it.id && it.id > m ? it.id : m),
          0
        );
        const newEmp: Employee = {
          ...emp,
          id: maxId + 1,
          dateOfBirth: emp.dateOfBirth
            ? new Date(emp.dateOfBirth)
            : emp.dateOfBirth,
        } as Employee;
        this.pendingAdds.push(newEmp);
        const updated = [...current, newEmp];
        this.employeesSubject.next(updated);
        return of({ success: true, data: newEmp });
      })
    );
  }
}
