// Performance monitoring utility for image loading
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  private static imageLoadTimes: Map<string, number> = new Map();

  static startTimer(label: string): void {
    this.metrics.set(label, performance.now());
  }

  static endTimer(label: string): number {
    const startTime = this.metrics.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.delete(label);
      return duration;
    }
    return 0;
  }

  static trackImageLoad(imageSrc: string, loadTime: number): void {
    this.imageLoadTimes.set(imageSrc, loadTime);
    
    // Log slow loading images
    if (loadTime > 2000) {
      console.warn(`Slow image load detected: ${imageSrc} took ${loadTime.toFixed(2)}ms`);
    }
  }

  static getImageLoadStats(): { average: number; slowest: string; slowestTime: number } {
    const times = Array.from(this.imageLoadTimes.values());
    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    let slowest = '';
    let slowestTime = 0;
    
    this.imageLoadTimes.forEach((time, src) => {
      if (time > slowestTime) {
        slowestTime = time;
        slowest = src;
      }
    });

    return { average, slowest, slowestTime };
  }

  static logPerformanceReport(): void {
    const stats = this.getImageLoadStats();
    console.log('📊 Image Performance Report:', {
      totalImages: this.imageLoadTimes.size,
      averageLoadTime: `${stats.average.toFixed(2)}ms`,
      slowestImage: stats.slowest,
      slowestLoadTime: `${stats.slowestTime.toFixed(2)}ms`,
    });
  }

  static clearMetrics(): void {
    this.metrics.clear();
    this.imageLoadTimes.clear();
  }
}

// Web Vitals monitoring
export const monitorWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Monitor Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry && lastEntry.entryType === 'largest-contentful-paint') {
        const lcp = lastEntry.startTime;
        console.log(`🎯 LCP: ${lcp.toFixed(2)}ms`);
        
        if (lcp > 2500) {
          console.warn('⚠️ LCP is above recommended threshold (2.5s)');
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'first-input') {
          const firstInputEntry = entry as PerformanceEventTiming;
          const fid = firstInputEntry.processingStart - firstInputEntry.startTime;
          console.log(`⚡ FID: ${fid.toFixed(2)}ms`);
          
          if (fid > 100) {
            console.warn('⚠️ FID is above recommended threshold (100ms)');
          }
        }
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });
  }
}; 