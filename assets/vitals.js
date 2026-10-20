// Official Web Vitals observers: actual field measurements, not synthetic scores.
import { onCLS, onINP, onLCP } from './vendor/web-vitals.js';
const report = metric => window.PlatformMetrics?.emit('web_vital', {
  metric_name: metric.name,
  metric_value: Math.round(metric.value * 1000) / 1000,
  metric_rating: metric.rating.replaceAll('-', '_')
});
onCLS(report); onINP(report); onLCP(report);
