export function getAppendableSuggestion(suggestion: string | number | undefined, value: any): string | undefined {
    const suggestionIncludesValue = typeof suggestion === "string" && typeof value === "string" && suggestion.toLowerCase().trim().startsWith(value.toLowerCase().trim());
    return (typeof value === "string" && suggestionIncludesValue)
        ? suggestion.substr(suggestion.toLowerCase().trim().indexOf(value.toLowerCase().trim()) + value.trim().length)
        : undefined;
}
