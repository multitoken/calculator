import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export class DateUtils {

  public static readonly DATE_FORMAT_SHORT: DateTimeFormatOptions = {
    day: '2-digit',
    hour: '2-digit',
    month: 'short',
    year: '2-digit',
  };

  public static toStringDate(timestamp: number, format: DateTimeFormatOptions): string {
    return new Date(timestamp).toLocaleDateString(['en-US'], format);
  }

}