/**
 * Matches text that is a complete number, as opposed to an intermediate state
 * that the user may be in the middle of typing, like "-", "0." or ".".
 * A decimal separator must be followed by at least one digit.
 */
const completeNumberRegex = /^[+-]?(?:\d+|\d*\.\d+)(?:[eE][+-]?\d+)?$/;

export type FilterTextInputParseResult = {
    /**
     * Whether the filter value should be updated with `value`.
     * It is `false` for intermediate inputs that are not a valid value yet,
     * like "-" or "0.", so that the text typed by the user can be kept as it is
     * while the current filter value is left untouched.
     */
    updateValue: boolean;

    /**
     * Parsed value, only relevant when `updateValue` is `true`.
     * `undefined` means the filter should be cleared.
     */
    value?: string | number;
};

/**
 * Turn the raw text of a filter input into the value used by the filter.
 *
 * The text shown to the user is never derived back from the parsed value, so
 * intermediate states like "0.", ".0" or "-" survive while typing. Numbers are
 * only committed to the filter once the text is a complete number, which makes
 * values such as 0.01 reachable by typing them character by character.
 *
 * Note that `0` is a perfectly valid filter value, only an empty input clears
 * the filter.
 */
export function parseFilterTextInput(text: string, dataType: "string" | "number"): FilterTextInputParseResult {

    if (dataType !== "number")
        return {
            updateValue: true,
            value: text
        };

    const trimmedText = text.trim();

    if (trimmedText === "")
        return {
            updateValue: true,
            value: undefined
        };

    if (!completeNumberRegex.test(trimmedText))
        return { updateValue: false };

    const parsedValue = Number(trimmedText);
    if (!isFinite(parsedValue))
        return { updateValue: false };

    return {
        updateValue: true,
        value: parsedValue
    };
}

/**
 * Text a filter input should display for a given filter value.
 */
export function filterValueToText(value: unknown): string {
    if (value === undefined || value === null)
        return "";
    return String(value);
}
