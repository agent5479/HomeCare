// HomeCare - Utility Functions
// Production Environment Management

// Environment Detection
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Production-Safe Logging System
const Logger = {
    log: function(...args) {
        if (!isProduction) {
            console.log(...args);
        }
    },
    error: function(...args) {
        // Always log errors, even in production
        console.error(...args);
    },
    warn: function(...args) {
        if (!isProduction) {
            console.warn(...args);
        }
    },
    info: function(...args) {
        if (!isProduction) {
            console.info(...args);
        }
    },
    debug: function(...args) {
        if (!isProduction) {
            console.debug(...args);
        }
    }
};

// Export for use in other modules
window.Logger = Logger;

// Environment Configuration
const EnvironmentConfig = {
    isProduction: isProduction,
    apiUrl: isProduction ? 'https://api.homecare.com' : 'http://localhost:3000',
    debugMode: !isProduction,
    enableDebugPanel: !isProduction,
    logLevel: isProduction ? 'error' : 'debug'
};

window.EnvironmentConfig = EnvironmentConfig;

// Performance Utilities

/**
 * Debounce function - limits how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Throttle function - ensures function is called at most once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between calls
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export utilities
window.debounce = debounce;
window.throttle = throttle;