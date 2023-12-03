export function serializeRegExp(input: RegExp): string {
    if (!input) return "";
    // const fragments = input.toString().match(/\/(.*?)\/([a-z]*)?$/i);
    // if (fragments) {
    //     if (fragments[2])
    //         return input.toString();
    //     return fragments[1];
    // }
    return input.toString();
}

/**
 * Get a RegExp out of a serialized string
 * @param input
 */
export function hydrateRegExp(input?: string): RegExp | undefined {
    if (!input) return undefined;
    const fragments = input.match(/\/(.*?)\/([a-z]*)?$/i);
    if (fragments) {
        return new RegExp(fragments[1], fragments[2] || "");
    } else {
        return new RegExp(input, "");
    }
}

export function isValidRegExp(input: string): boolean {
    const fullRegexp = input.match(/\/((?![*+?])(?:[^\r\n[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/);
    if (fullRegexp)
        return true;
    const simpleRegexp = input.match(/((?![*+?])(?:[^\r\n[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*])+)/);
    return !!simpleRegexp;
}
