export function createEventEmitter() {
  const listeners = {};

  return {
    on(event, callback) {
      if (!listeners[event]) listeners[event] = new Set();
      listeners[event].add(callback);
      return () => listeners[event].delete(callback);
    },
    emit(event, ...args) {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(...args));
      }
    },
    off(event, callback) {
      if (listeners[event]) listeners[event].delete(callback);
    },
    removeAll() {
      Object.keys(listeners).forEach((k) => delete listeners[k]);
    },
  };
}
