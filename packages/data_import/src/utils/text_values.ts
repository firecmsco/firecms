/**
 * Values typed into a spreadsheet or a CSV as text, read once the property they
 * are mapped to says what they should be.
 */

const DECIMAL = /^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i;

/**
 * A number written as text: `1234`, `-12.5`, `1,234.5`, `$5.00`, `50%`, `(100)`,
 * `1.234,5`, `12,5`, `1 234`.
 *
 * With both separators, the one written last is the decimal mark. A lone comma
 * followed by exactly three digits groups thousands (`1,234` is 1234, as SheetJS
 * read it); any other lone comma is a decimal mark (`12,5`, from a comma-decimal
 * locale). Anything else is null rather than NaN: `Number("1,234")` is NaN, and
 * NaN was written to the document.
 */
export function parseNumberText(text: string): number | null {
    let s = text.trim();
    let sign = 1;
    // An accounting negative: (100).
    if (/^\(.*\)$/.test(s)) {
        sign = -1;
        s = s.slice(1, -1).trim();
    }
    let divisor = 1;
    if (s.endsWith("%")) {
        divisor = 100;
        s = s.slice(0, -1).trim();
    }
    // Currency symbols, and the spaces and apostrophes some locales group digits with.
    s = s.replace(/[\s  '’$€£¥₹]/g, "");

    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma !== -1 && lastDot !== -1) {
        s = lastComma > lastDot
            ? s.replace(/\./g, "").replace(",", ".")
            : s.replace(/,/g, "");
    } else if (lastComma !== -1) {
        s = /^[-+]?\d{1,3}(,\d{3})+$/.test(s)
            ? s.replace(/,/g, "")
            : s.replace(",", ".");
    } else if (/^[-+]?\d{1,3}(\.\d{3}){2,}$/.test(s)) {
        s = s.replace(/\./g, "");
    }

    if (!DECIMAL.test(s)) return null;
    const value = sign * Number(s) / divisor;
    return Number.isFinite(value) ? value : null;
}

const TRUE_TEXT = new Set(["true", "yes", "1"]);
const FALSE_TEXT = new Set(["false", "no", "0"]);

/**
 * `TRUE`, `True`, `yes`, `1`, and their opposites. Excel and Google Sheets write
 * booleans in capitals. Null when the text is neither.
 */
export function parseBooleanText(text: string): boolean | null {
    const lower = text.trim().toLowerCase();
    if (TRUE_TEXT.has(lower)) return true;
    if (FALSE_TEXT.has(lower)) return false;
    return null;
}

// 2024-01-15, 2024-01-15 10:30, 2024-01-15T10:30:15.250: no zone.
const ISO_LOCAL = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?)?$/;
// The same with Z or an offset: what FireCMS's own export writes.
const ISO_ZONED = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)(Z|[+-]\d{2}:?\d{2})$/i;

function readIsoLocal(match: RegExpExecArray): Date | null {
    const [, year, month, day, hours = "0", minutes = "0", seconds = "0", millis = "0"] = match;
    if (Number(hours) > 23 || Number(minutes) > 59 || Number(seconds) > 59) return null;
    // From local noon, which no daylight-saving change skips; and setFullYear
    // rather than the constructor, which maps years 0-99 to 1900-1999.
    const date = new Date(2000, 0, 1, 12);
    date.setFullYear(Number(year), Number(month) - 1, Number(day));
    // 2024-02-31 rolls over into March: not a date.
    if (date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
    date.setHours(Number(hours), Number(minutes), Number(seconds), Number(millis.padEnd(3, "0")));
    return date;
}

function readIsoZoned(match: RegExpExecArray): Date | null {
    const [, day, time, zone] = match;
    const offset = zone.toUpperCase() === "Z" || zone.includes(":")
        ? zone
        : `${zone.slice(0, 3)}:${zone.slice(3)}`;
    const date = new Date(`${day}T${time}${offset}`);
    return isNaN(date.getTime()) ? null : date;
}

/** Whether the text is an ISO 8601 date or date-time: a date column, not a text one. */
export function isIsoDateText(text: string): boolean {
    const s = text.trim();
    const local = ISO_LOCAL.exec(s);
    if (local) return readIsoLocal(local) !== null;
    const zoned = ISO_ZONED.exec(s);
    return zoned !== null && readIsoZoned(zoned) !== null;
}

/**
 * A date written as text.
 *
 * An ISO date or date-time without a zone (`2024-01-15`, `2024-01-15 10:30`) is
 * that wall-clock reading in the viewer's zone, as a spreadsheet date cell is.
 * `new Date("2024-01-15")` alone is UTC midnight, which FireCMS shows as the day
 * before anywhere west of UTC. With a zone it is that instant. Any other text goes
 * to `new Date`, and is null if that can't read it either, rather than an Invalid
 * Date, which Firestore refuses and which failed the whole save.
 */
export function parseDateText(text: string): Date | null {
    const s = text.trim();
    const local = ISO_LOCAL.exec(s);
    if (local) return readIsoLocal(local);
    const zoned = ISO_ZONED.exec(s);
    if (zoned) return readIsoZoned(zoned);
    const date = new Date(s);
    return isNaN(date.getTime()) ? null : date;
}
