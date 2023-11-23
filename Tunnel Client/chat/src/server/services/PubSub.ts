type Listener<Message> = (message: Message) => void;

export default class PubSub<Event, Message> {
  private subscriptions: Map<Event, Listener<Message>[]> = new Map();

  subscribe(event: Event, listener: Listener<Message>): () => void {
    this.subscriptions.set(event, (this.subscriptions.get(event) || []).concat(listener));

    return () => {
      this.unsubscribe(event, listener);
    };
  }

  unsubscribe(event: Event, listener: Listener<Message>): void {
    const eventListeners = this.subscriptions.get(event);
    if (eventListeners) {
      this.subscriptions.set(
        event,
        eventListeners.filter((l) => l !== listener),
      );
    }
  }

  publish(event: Event, message: Message): void {
    const eventListeners = this.subscriptions.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        listener(message);
      });
    }
  }

  clear(event?: Event): void {
    if (event) {
      this.subscriptions.delete(event);
    } else {
      this.subscriptions.clear();
    }
  }
}
