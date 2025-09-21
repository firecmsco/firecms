/**
 * Configure console log levels based on environment variable
 * Call this early in your application to set up proper logging levels
 */
export function configureLogLevel(logLevel?: string) {
    const LOG_LEVEL = logLevel || process.env.LOG_LEVEL || 'info';
    const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
    const currentLevel = logLevels[LOG_LEVEL as keyof typeof logLevels] ?? 2;

    if (currentLevel < 3) console.debug = () => {};
    if (currentLevel < 2) console.log = () => {};
    if (currentLevel < 1) console.warn = () => {};
    if (currentLevel < 0) console.error = () => {};
}

/**
 * Reset console methods to their original state
 */
export function resetConsole() {
    // Store original methods if not already stored
    if (!(global as any).__originalConsole) {
        (global as any).__originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            debug: console.debug
        };
    }

    const original = (global as any).__originalConsole;
    console.log = original.log;
    console.warn = original.warn;
    console.error = original.error;
    console.debug = original.debug;
}
