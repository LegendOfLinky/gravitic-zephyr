// EventBus.js - Central event system for game-wide communication
class EventBus {
    static listeners = new Map();
    static debug = false;  // Toggle event logging

    /**
     * Subscribe to an event
     * @param {string} event - Event name to listen for
     * @param {Function} callback - Function to call when event occurs
     * @param {Object} context - 'this' context for callback (optional)
     * @returns {Function} Unsubscribe function
     */

    static on(event, callback, context = null) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        // Bind context if provided
        const boundCallback = context ? callback.bind(context) : callback;
        this.listeners.get(event).add(boundCallback);

        // Return unsubscribe function
        return () => this.off(event, boundCallback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback to remove
     */

    static off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
            // Clean up empty event sets
            if (this.listeners.get(event).size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Data to pass to listeners
     */

    static emit(event, data = null) {
        if (this.debug) {
            console.log(`[EventBus] ${event}`, data);
        }

        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event to clear (optional, if not provided clears all)
     */

    static clear(event = null) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get count of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */

    static listenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).size : 0;
    }
}

// Make available globally
window.EventBus = EventBus;
