/**
 * EventBus - Central event dispatcher using CustomEvent
 *
 * Benefits of CustomEvent:
 * - Native browser API (no dependencies)
 * - Can attach to document or custom target
 * - Built-in event bubbling/capturing
 * - DevTools support
 */

export class EventBus {
  constructor() {
    // Use document as event target for global events
    this.target = document;

    // Track listeners for cleanup
    this.listeners = new Map();
  }

  /**
   * Emit an event
   * @param {string} eventType - Event type from Events constants
   * @param {*} detail - Event payload (will be available as event.detail)
   */
  emit(eventType, detail = {}) {
    const event = new CustomEvent(eventType, {
      detail,
      bubbles: false,  // Don't bubble (we're using document directly)
      cancelable: false
    });

    this.target.dispatchEvent(event);

    // Log in development for debugging
    if (this.debug) {
      console.log(`[EventBus] ${eventType}`, detail);
    }
  }

  /**
   * Listen to an event
   * @param {string} eventType - Event type to listen for
   * @param {Function} handler - Handler function (receives event.detail)
   * @returns {Function} Unsubscribe function
   */
  on(eventType, handler) {
    // Wrap handler to extract detail from event
    const wrappedHandler = (event) => {
      handler(event.detail);
    };

    // Store reference for cleanup
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push({ handler, wrappedHandler });

    // Add event listener
    this.target.addEventListener(eventType, wrappedHandler);

    // Return unsubscribe function
    return () => this.off(eventType, handler);
  }

  /**
   * Remove event listener
   * @param {string} eventType - Event type
   * @param {Function} handler - Original handler function
   */
  off(eventType, handler) {
    const listeners = this.listeners.get(eventType);
    if (!listeners) return;

    // Find the wrapped handler
    const index = listeners.findIndex(l => l.handler === handler);
    if (index === -1) return;

    const { wrappedHandler } = listeners[index];
    this.target.removeEventListener(eventType, wrappedHandler);

    // Remove from tracking
    listeners.splice(index, 1);
    if (listeners.length === 0) {
      this.listeners.delete(eventType);
    }
  }

  /**
   * Listen to an event once
   * @param {string} eventType - Event type
   * @param {Function} handler - Handler function
   */
  once(eventType, handler) {
    const wrappedHandler = (detail) => {
      handler(detail);
      this.off(eventType, wrappedHandler);
    };

    return this.on(eventType, wrappedHandler);
  }

  /**
   * Remove all listeners for an event type (or all if no type specified)
   * @param {string} [eventType] - Optional event type
   */
  clear(eventType) {
    if (eventType) {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.forEach(({ wrappedHandler }) => {
          this.target.removeEventListener(eventType, wrappedHandler);
        });
        this.listeners.delete(eventType);
      }
    } else {
      // Clear all listeners
      this.listeners.forEach((listeners, type) => {
        listeners.forEach(({ wrappedHandler }) => {
          this.target.removeEventListener(type, wrappedHandler);
        });
      });
      this.listeners.clear();
    }
  }

  /**
   * Enable debug logging
   */
  enableDebug() {
    this.debug = true;
  }

  /**
   * Disable debug logging
   */
  disableDebug() {
    this.debug = false;
  }
}
