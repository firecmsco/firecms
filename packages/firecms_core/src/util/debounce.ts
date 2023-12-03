/**
 * @ignore
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait = 166) {
    let timeout: ReturnType<typeof setTimeout>;

    function debounced(...args: Parameters<T>) {
        const later = () => {
            // @ts-ignore
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    }

    debounced.clear = () => {
        clearTimeout(timeout);
    };

    return debounced as T & Cancelable;
}

/**
 * @ignore
 */
export interface Cancelable {
    clear(): void;
}
