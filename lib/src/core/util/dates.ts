export const defaultDateFormat = "MMMM dd, yyyy, HH:mm:ss";

export function setDateToMidnight(input?: Date): Date | undefined | null {
    if (!input) return input;
    input.setHours(0, 0, 0, 0);
    return input;
}
