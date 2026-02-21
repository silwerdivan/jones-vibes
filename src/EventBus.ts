// A simple pub/sub module for decoupled communication.
type Callback = (data?: any) => void;

interface EventBusInterface {
  events: Record<string, Callback[]>;
  subscribe(eventName: string, callback: Callback): void;
  publish(eventName: string, data?: any): void;
}

const EventBus: EventBusInterface = {
  events: {},

  /**
   * Subscribe to an event.
   * @param {string} eventName The name of the event (e.g., 'stateChanged').
   * @param {function} callback The function to execute when the event is published.
   */
  subscribe(eventName: string, callback: Callback): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  },

  /**
   * Publish an event.
   * @param {string} eventName The name of the event to publish.
   * @param {*} data The data to pass to all subscribed callbacks.
   */
  publish(eventName: string, data?: any): void {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        // Pass the data to the callback.
        callback(data);
      });
    }
  }
};

export default EventBus;
