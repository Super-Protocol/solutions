export class Queue {
  private queue: (() => Promise<any>)[] = [];
  private running = false;

  enqueue(callback: () => Promise<any>): void {
    this.queue.push(callback);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const callback = this.queue.shift();
      try {
        await callback?.();
      } catch (error) {
        console.error('Error executing callback:', error);
      }
    }

    this.running = false;
  }
}