import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router); // Внедряем Router
  const snackBar = inject(MatSnackBar);
  return next(req).pipe(
      catchError((err) => {
        if(err.status === 401){
          localStorage.removeItem('access_token')
          localStorage.removeItem('userId')
          snackBar.open('Сессия истекла, войдите снова', 'OK', { duration: 3000 });
          router.navigate(['/login'])
        }
        return throwError(() => err);
      })
  );
};
