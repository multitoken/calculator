import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export class DateUtils {

  public static readonly FORMAT_MMM_DD: DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
  };

  public static readonly FORMAT_YYYY_HH: DateTimeFormatOptions = {
    hour: '2-digit',
    year: 'numeric'
  };

  public static readonly DATE_FORMAT_SHORT: DateTimeFormatOptions = {
    day: '2-digit',
    hour: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  public static toFormat(value: number | object, format ?: DateTimeFormatOptions): string {
    const date: any = typeof value === 'number' ? new Date(value) : value;

    if (typeof date !== 'object') {
      return '';
    }

    return format ? date.toLocaleDateString(['en-US'], format) : date.toString();
  }

}
