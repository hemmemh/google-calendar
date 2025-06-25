import { NativeDateAdapter } from '@angular/material/core';
import { DateTime } from 'luxon';

export class LuxonDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (value && typeof value === 'string') {
      const date = DateTime.fromISO(value);
      if (date.isValid) {
        return date.toJSDate();
      }
    }
    return super.parse(value);
  }

  override format(date: Date, displayFormat: Object): string {
    return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED);
  }

  override getDayOfWeek(date: Date): number {
    return DateTime.fromJSDate(date).weekday;
  }

  // Получаем имена месяцев на основе локали


  override setLocale(locale: string): void {
    super.setLocale(locale);
    DateTime.local().setLocale(locale);  // Устанавливаем локаль для Luxon
  }
}