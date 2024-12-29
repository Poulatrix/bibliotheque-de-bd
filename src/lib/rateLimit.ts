interface QueueItem {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RateLimiter {
  private queue: QueueItem[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minDelay = 600; // 600ms between requests = ~100 requests/minute
  private retryCount = 0;
  private readonly maxRetries = 3;

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
      }

      const item = this.queue.shift()!;
      try {
        console.log('Processing request from queue...');
        this.lastRequestTime = Date.now();
        const result = await item.fn();
        this.retryCount = 0; // Reset retry count on success
        item.resolve(result);
      } catch (error: any) {
        console.error('Request error:', error);
        
        if (error?.status === 429 && this.retryCount < this.maxRetries) {
          // Rate limit hit - put the request back in queue and wait
          console.log(`Rate limit hit, retry attempt ${this.retryCount + 1}/${this.maxRetries}`);
          this.queue.unshift(item);
          this.retryCount++;
          await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
          continue;
        }

        if (this.retryCount >= this.maxRetries) {
          console.error('Max retries reached, failing request');
          item.reject(new Error('Max retries reached for rate limited request'));
        } else {
          item.reject(error);
        }
        this.retryCount = 0;
      }

      // Add a small delay between requests even if we haven't hit the rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }
}

export const rateLimiter = new RateLimiter();