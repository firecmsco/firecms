/**
 * Run async tasks with at most `max` of them in flight; the rest wait their
 * turn, in the order they were started.
 */
export function createConcurrencyLimit(max: number) {
    let running = 0;
    const waiting: (() => void)[] = [];

    const acquire = (): Promise<void> => {
        if (running < max) {
            running++;
            return Promise.resolve();
        }
        return new Promise(resolve => waiting.push(resolve));
    };

    const release = () => {
        // The slot passes straight to the next task, so a task started in
        // between cannot take it as well.
        const next = waiting.shift();
        if (next) {
            next();
        } else {
            running--;
        }
    };

    return async function run<T>(task: () => Promise<T>): Promise<T> {
        await acquire();
        try {
            return await task();
        } finally {
            release();
        }
    };
}
