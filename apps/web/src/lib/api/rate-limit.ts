export class RateLimiter {
  private cache = new Map<string, { count: number; expiresAt: number }>();
  private windowMs: number;
  private maxLimit: number;

  constructor(windowMs: number, maxLimit: number) {
    this.windowMs = windowMs;
    this.maxLimit = maxLimit;

    // Background cleanup interval
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now > value.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60 * 1000).unref(); // Run every minute, unref so it doesn't block process exit
  }

  /**
   * Check if a given identifier has exceeded the rate limit
   * @param identifier e.g., IP address
   * @returns true if limited, false otherwise
   */
  isLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.cache.get(identifier);

    if (!record || now > record.expiresAt) {
      this.cache.set(identifier, { count: 1, expiresAt: now + this.windowMs });
      return false;
    }

    if (record.count >= this.maxLimit) {
      return true;
    }

    record.count += 1;
    return false;
  }
}
