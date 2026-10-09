import { Injectable } from '@angular/core';
import { DateTime, DurationLike } from 'luxon';
import { DateDifferenceUnit, DateInput } from '../interfaces/util.interface';

@Injectable({ providedIn: 'root' })
export class DateService {
  readonly defaultZone = 'America/Lima';

  /** Convierte ISO, Date, timestamp o DateTime a DateTime. Devuelve null si es inválido. */
  parse(value: DateInput, zone = this.defaultZone): DateTime | null {
    if (value == null || value === '') return null;

    const date = DateTime.isDateTime(value)
      ? value
      : typeof value === 'string'
        ? DateTime.fromISO(value, { zone, setZone: true })
        : typeof value === 'number'
          ? DateTime.fromMillis(value, { zone })
          : DateTime.fromJSDate(value, { zone });

    return date.isValid ? date : null;
  }

  format(value: DateInput, format = 'dd/MM/yyyy', zone = this.defaultZone): string {
    return this.parse(value, zone)?.setZone(zone).toFormat(format) ?? '';
  }

  toIso(value: DateInput, zone = this.defaultZone): string | null {
    return this.parse(value, zone)?.toUTC().toISO() ?? null;
  }

  add(value: DateInput, duration: DurationLike, zone = this.defaultZone): DateTime | null {
    return this.parse(value, zone)?.plus(duration) ?? null;
  }

  subtract(value: DateInput, duration: DurationLike, zone = this.defaultZone): DateTime | null {
    return this.parse(value, zone)?.minus(duration) ?? null;
  }

  difference(start: DateInput, end: DateInput, unit: DateDifferenceUnit = 'days', zone = this.defaultZone): number | null {
    const startDate = this.parse(start, zone);
    const endDate = this.parse(end, zone);
    return startDate && endDate ? endDate.diff(startDate, unit).get(unit) : null;
  }

  isAfter(first: DateInput, second: DateInput, zone = this.defaultZone): boolean {
    const firstDate = this.parse(first, zone);
    const secondDate = this.parse(second, zone);
    return !!firstDate && !!secondDate && firstDate.toMillis() > secondDate.toMillis();
  }

  isBefore(first: DateInput, second: DateInput, zone = this.defaultZone): boolean {
    const firstDate = this.parse(first, zone);
    const secondDate = this.parse(second, zone);
    return !!firstDate && !!secondDate && firstDate.toMillis() < secondDate.toMillis();
  }

  isSameDay(first: DateInput, second: DateInput, zone = this.defaultZone): boolean {
    const firstDate = this.parse(first, zone);
    const secondDate = this.parse(second, zone);
    return !!firstDate && !!secondDate && firstDate.hasSame(secondDate, 'day');
  }
}
