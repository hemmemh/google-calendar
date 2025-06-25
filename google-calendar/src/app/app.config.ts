import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bearerInterceptor } from './interceptors/bearer.interceptor';
import {  DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { Settings } from 'luxon';
import { LuxonDateAdapter } from './luxon-adapter';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';

Settings.defaultLocale = 'ru';

export const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'l', // Формат для ввода даты
    timeInput: 'HH:mm', // Формат для ввода времени (например, 14:30)
  },
  display: {
    dateInput: 'l',  // Формат отображения даты
    monthYearLabel: 'MMMM YYYY',  // Формат для месяца и года
    dateA11yLabel: 'LL',  // Формат для доступности
    monthYearA11yLabel: 'MMMM YYYY',  // Формат для доступности месяца и года
    timeInput: 'HH:mm', // Формат отображения времени (например, 14:30)
    timeOptionLabel: 'HH:mm', // Формат для отображения времени в выпадающем списке времени
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),  
    provideHttpClient( withInterceptors([bearerInterceptor, unauthorizedInterceptor])),
  ],
  
};
