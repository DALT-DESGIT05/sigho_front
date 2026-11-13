import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export function procesar_error(error: HttpErrorResponse): Observable<never> {
  const response = error.error && typeof error.error === 'object' ? error.error : {};

  return throwError(() => ({ ...response, statusCode: error.status }));
}
