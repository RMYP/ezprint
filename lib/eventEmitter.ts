import { EventEmitter } from "events";

declare global {
  var eventEmitter: EventEmitter | undefined;
}

const eventEmitter = global.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  global.eventEmitter = eventEmitter; 
}

export { eventEmitter };
