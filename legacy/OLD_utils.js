// BeeMarshall - Utility Functions
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
    apiUrl: isProduction ? 'https://api.beemarshall.com' : 'http://localhost:3000',
    debugMode: !isProduction,
    enableDebugPanel: !isProduction,
    logLevel: isProduction ? 'error' : 'debug'
};

window.EnvironmentConfig = EnvironmentConfig;
