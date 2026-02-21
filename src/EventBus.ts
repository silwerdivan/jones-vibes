// A simple pub/sub module for decoupled communication.
type Callback = (data?: any) => void;

interface EventBusInterface {
  events: Record<string, Callback[]>;
  subscribe(eventName: string, callback: Callback): void;
  publish(eventName: string, data?: any): void;
}

/**
 * UI Intent Events: Emitted by the UI to request a state change.
 */
export const UI_EVENTS = {
  REST_END_TURN: 'UI_INTENT_REST_END_TURN',
  ADVANCE_TURN: 'UI_INTENT_ADVANCE_TURN',
  WORK_SHIFT: 'UI_INTENT_WORK_SHIFT',
  BUY_CAR: 'UI_INTENT_BUY_CAR',
  TRAVEL: 'UI_INTENT_TRAVEL',
  BANK_DEPOSIT: 'UI_INTENT_BANK_DEPOSIT',
  BANK_WITHDRAW: 'UI_INTENT_BANK_WITHDRAW',
  BANK_LOAN: 'UI_INTENT_BANK_LOAN',
  BANK_REPAY: 'UI_INTENT_BANK_REPAY',
  APPLY_JOB: 'UI_INTENT_APPLY_JOB',
  TAKE_COURSE: 'UI_INTENT_TAKE_COURSE',
  BUY_ITEM: 'UI_INTENT_BUY_ITEM',
  REQUEST_STATE_REFRESH: 'UI_REQUEST_STATE_REFRESH'
} as const;

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
