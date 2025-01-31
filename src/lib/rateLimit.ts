export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillTime: number;

  constructor(maxTokens: number, refillTime: number) {
    this.tokens = maxTokens;
    this.maxTokens = maxTokens;
    this.refillTime = refillTime;
    this.lastRefill = Date.now();
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForToken();
    return fn();
  }

  private async waitForToken(): Promise<void> {
    this.refillTokens();
    
    if (this.tokens <= 0) {
      const waitTime = this.calculateWaitTime();
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.refillTokens();
    }
    
    this.tokens--;
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const refillCount = Math.floor(timePassed / this.refillTime);
    
    if (refillCount > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + refillCount);
      this.lastRefill = now;
    }
  }

  private calculateWaitTime(): number {
    return this.refillTime - (Date.now() - this.lastRefill);
  }
}