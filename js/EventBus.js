const EventBus = {
  listeners: {},

  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },

  publish(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback(data);
      });
    }
  }
};

export default EventBus;