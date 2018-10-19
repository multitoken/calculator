import { BasicAnalytics } from './BasicAnalytics';
import { ExceptionAnalytics } from './ExceptionAnalytics';

export interface AnalyticsManager extends BasicAnalytics, ExceptionAnalytics {
}
