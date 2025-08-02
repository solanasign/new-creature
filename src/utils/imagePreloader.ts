// Image preloader utility for critical images
export class ImagePreloader {
  private static preloadedImages = new Set<string>();

  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.add(src);
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`));
      };

      img.src = src;
    });
  }

  static preloadImages(imageUrls: string[]): Promise<void[]> {
    return Promise.all(imageUrls.map(url => this.preloadImage(url)));
  }

  static isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }

  static clearCache(): void {
    this.preloadedImages.clear();
  }
}

// Critical images that should be preloaded
export const CRITICAL_IMAGES = [
  '/src/assets/logo.png',
  '/src/assets/logowhite.png',
  '/src/assets/home-image.jpg',
];

// Preload critical images on app startup
export const preloadCriticalImages = () => {
  if (typeof window !== 'undefined') {
    // Preload critical images after a short delay to not block initial render
    setTimeout(() => {
      ImagePreloader.preloadImages(CRITICAL_IMAGES).catch(console.warn);
    }, 100);
  }
}; 