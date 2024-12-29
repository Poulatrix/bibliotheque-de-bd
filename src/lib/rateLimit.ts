interface QueueItem {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RateLimiter {
  private queue: QueueItem[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minDelay = 600; // 600ms entre chaque requête = ~100 requêtes/minute

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
        this.lastRequestTime = Date.now();
        const result = await item.fn();
        item.resolve(result);
      } catch (error) {
        if (error.status === 429) {
          // En cas d'erreur 429, remettre la requête dans la file d'attente
          console.log('Rate limit atteint, nouvelle tentative dans 1 minute...');
          this.queue.unshift(item);
          await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
          item.reject(error);
        }
      }
    }

    this.processing = false;
  }
}

export const rateLimiter = new RateLimiter();