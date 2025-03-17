export class TimeSystem {
  private currentTime: number; // Unix timestamp
  private timeScale: number = 1; // 1 = real-time, >1 = faster, <1 = slower
  
  constructor(startTime?: number) {
    this.currentTime = startTime || Date.now();
  }
  
  public getCurrentTime(): number {
    return this.currentTime;
  }
  
  public getFormattedTime(): string {
    return new Date(this.currentTime).toLocaleString();
  }
  
  public setTimeScale(scale: number): void {
    if (scale <= 0) {
      throw new Error("Time scale must be positive");
    }
    this.timeScale = scale;
  }
  
  public advanceTime(milliseconds: number = 1000): void {
    this.currentTime += milliseconds * this.timeScale;
  }
  
  public getTimeScale(): number {
    return this.timeScale;
  }
} 