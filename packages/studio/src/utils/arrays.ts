export function toArray<T>(input?: T | T[]):T[] {
    return Array.isArray(input) ? input : (input ? [input] : []);
}
