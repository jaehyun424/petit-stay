// ============================================
// Petit Stay - Core Web Vitals Monitoring
// Tracks LCP, INP, CLS using web-vitals library
// ============================================

import type { Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
    // In production, send to your analytics endpoint
    if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    }

    // Example: send to Google Analytics or custom endpoint
    // navigator.sendBeacon('/api/vitals', JSON.stringify(metric));
}

export function reportWebVitals() {
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
        onCLS(sendToAnalytics);
        onINP(sendToAnalytics);
        onLCP(sendToAnalytics);
        onFCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
    });
}
