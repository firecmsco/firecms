/**
 * The header row of a spreadsheet, as a column index → name map.
 *
 * A map rather than an array, so that a blank header in the middle of the row
 * can be dropped without moving the names after it: with an array compacted by
 * `filter(Boolean)`, every later name shifts one column left and each value lands
 * in its neighbour's field.
 */
export interface SheetHeaders {
    /** Column index (0-based) → the field name that column feeds. */
    byColumn: Map<number, string>;
    /** The names in column order: the import's `propertiesOrder`. */
    order: string[];
}

/** A cell as `read-excel-file` hands it over: a primitive, or null when empty. */
export type SheetCell = string | number | boolean | Date | null;

/**
 * Read the header names out of the first row. A column whose header is blank is
 * left out entirely, so it contributes neither a field nor a value.
 */
export function getWorksheetHeaders(headerRow: readonly SheetCell[]): SheetHeaders {
    const byColumn = new Map<number, string>();
    const order: string[] = [];

    headerRow.forEach((cell, index) => {
        // `0` and `false` are legitimate header text and must survive; only an
        // empty cell and an all-whitespace one are "no header".
        if (cell === null || cell === undefined) return;
        const name = (cell instanceof Date ? cell.toISOString() : String(cell)).trim();
        if (!name) return;
        byColumn.set(index, name);
        order.push(name);
    });

    return { byColumn, order };
}
