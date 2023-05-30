export type RouteViews = 'all' | 'completed' | 'active';

export interface IMail {
  from?: string;
  cc?: string;
  subject?: string;
  to?: string;
  message?: string;
}
