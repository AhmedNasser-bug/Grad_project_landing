/**
 * HyperframesScrubber.ts
 * Scroll-Driven Video & Image Frame Scrubber Engine
 * Adheres to WAF REL-01 (5000ms Network Fetch Timeout & Poster Fallback) & PERF-02
 */

export interface HyperframesScrubberOptions {
  videoUrl?: string;
  posterUrl?: string;
  totalFrames?: number;
  frameUrlTemplate?: (index: number) => string;
  fetchTimeoutMs?: number; // default 5000ms (WAF REL-01)
  lerpFactor?: number; // default 0.1
  onReady?: () => void;
  onFallback?: (reason: string) => void;
}

export class HyperframesScrubber {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private posterImage: HTMLImageElement | null = null;

  private isUsingVideo: boolean = false;
  private isFallbackMode: boolean = false;
  private isDestroyed: boolean = false;

  private targetProgress: number = 0;
  private currentProgress: number = 0;
  private lerpFactor: number = 0.1;
  private fetchTimeoutMs: number = 5000;

  private animationFrameId: number | null = null;

  constructor(container: HTMLElement, options: HyperframesScrubberOptions = {}) {
    this.container = container;
    this.lerpFactor = options.lerpFactor ?? 0.1;
    this.fetchTimeoutMs = options.fetchTimeoutMs ?? 5000;

    // Create canvas inside container
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full object-cover rounded-lg';
    this.ctx = this.canvas.getContext('2d');

    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.container.appendChild(this.canvas);

    this.handleResize();
    window.addEventListener('resize', this.boundHandleResize, { passive: true });

    // Initialize asset loading with WAF REL-01 timeout
    this.initMedia(options);
    this.startLoop();
  }

  private boundHandleResize = () => this.handleResize();

  private handleResize(): void {
    if (!this.canvas || !this.container) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 450;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
  }

  /**
   * WAF REL-01 5000ms Fetch Timeout Implementation
   * Uses Promise.race with a timeout controller to guarantee fallback within 5000ms.
   */
  private async initMedia(options: HyperframesScrubberOptions): Promise<void> {
    const posterUrl = options.posterUrl ?? '';
    const videoUrl = options.videoUrl ?? '';

    // Load poster first as baseline fallback
    if (posterUrl) {
      this.posterImage = new Image();
      this.posterImage.src = posterUrl;
    }

    if (videoUrl) {
      try {
        await this.loadVideoWithTimeout(videoUrl, this.fetchTimeoutMs);
        if (this.isDestroyed) return;
        this.isUsingVideo = true;
        if (options.onReady) options.onReady();
        return;
      } catch (err: any) {
        if (this.isDestroyed) return;
        console.warn(`[HyperframesScrubber] Video fetch timed out or failed (${err?.message}). Activating poster fallback.`);
        this.activateFallback(options, 'Video fetch timeout or error');
        return;
      }
    }

    if (this.isDestroyed) return;
    // Default fallback if no valid video URL provided
    this.activateFallback(options, 'No video source provided');
  }

  private loadVideoWithTimeout(url: string, timeoutMs: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';

      let isSettled = false;

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          video.src = '';
          video.load();
          reject(new Error(`WAF REL-01: Video load exceeded ${timeoutMs}ms limit`));
        }
      }, timeoutMs);

      video.onloadedmetadata = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          this.video = video;
          resolve();
        }
      };

      video.onerror = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          reject(new Error('Video network load error'));
        }
      };

      video.load();
    });
  }

  private activateFallback(options: HyperframesScrubberOptions, reason: string): void {
    this.isFallbackMode = true;
    if (options.onFallback) {
      options.onFallback(reason);
    }
  }

  /**
   * Sets current scroll progress ratio (0.0 to 1.0)
   */
  public setScrollProgress(progress: number): void {
    if (isNaN(progress)) progress = 0;
    this.targetProgress = Math.max(0, Math.min(1, progress));
  }

  private render = (): void => {
    if (this.isDestroyed || !this.ctx || !this.canvas) return;

    // Apply smooth exponential lerp scrubbing
    this.currentProgress += (this.targetProgress - this.currentProgress) * this.lerpFactor;

    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.clearRect(0, 0, width, height);

    if (this.isUsingVideo && this.video && this.video.duration) {
      const targetTime = this.currentProgress * this.video.duration;
      if (Math.abs(this.video.currentTime - targetTime) > 0.03) {
        this.video.currentTime = targetTime;
      }
      try {
        this.ctx.drawImage(this.video, 0, 0, width, height);
      } catch (e) {
        // Fallback to poster if drawImage fails
        if (this.posterImage && this.posterImage.complete) {
          this.ctx.drawImage(this.posterImage, 0, 0, width, height);
        }
      }
    } else if (this.posterImage && this.posterImage.complete) {
      this.ctx.drawImage(this.posterImage, 0, 0, width, height);
    } else {
      // Draw Swiss minimal fallback canvas representation
      this.ctx.fillStyle = '#F8FAFC';
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.fillStyle = '#004AC6';
      this.ctx.font = '14px JetBrains Mono, monospace';
      this.ctx.fillText(`HYPERFRAMES VIDEO SCRUBBER // PROGRESS: ${(this.currentProgress * 100).toFixed(1)}%`, 20, 40);
    }

    this.animationFrameId = requestAnimationFrame(this.render);
  };

  public startLoop(): void {
    if (this.animationFrameId === null && !this.isDestroyed) {
      this.animationFrameId = requestAnimationFrame(this.render);
    }
  }

  public stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.stopLoop();
    window.removeEventListener('resize', this.boundHandleResize);

    if (this.video) {
      this.video.pause();
      this.video.src = '';
      this.video.load();
      this.video = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
