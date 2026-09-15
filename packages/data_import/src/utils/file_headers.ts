import { isPrototypePollutingKey } from "./prototype_keys";

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

/** A cell as the readers hand it over: a primitive, or null when empty. */
export type SheetCell = string | number | boolean | Date | null;

function isEmptyCell(cell: SheetCell | undefined): boolean {
    return cell === null || cell === undefined;
}

function headerText(cell: SheetCell | undefined): string {
    if (isEmptyCell(cell)) return "";
    return (cell instanceof Date ? cell.toISOString() : String(cell)).trim();
}

/**
 * Name the columns from the header row.
 *
 * - A blank header over a column that holds data is named `ColumnN` after its
 *   position, so its values are kept; over an empty column (a trailing delimiter,
 *   a spacer) it is left out.
 * - A repeated name gets a suffix, `name`, `name_1`, `name_2`, as SheetJS did.
 *   Without one, the second column's values overwrote the first's and a column of
 *   data disappeared.
 * - A `__proto__` header is left out: it would be the prototype setter, not a key.
 */
export function getWorksheetHeaders(headerRow: readonly SheetCell[],
                                    dataRows: ReadonlyArray<readonly SheetCell[]> = []): SheetHeaders {
    const byColumn = new Map<number, string>();
    const order: string[] = [];
    const used = new Set<string>();

    // A loop, not `Math.max(...lengths)`: spreading 100k rows into arguments
    // overflows the stack.
    const width = dataRows.reduce((max, row) => Math.max(max, row.length), headerRow.length);
    for (let index = 0; index < width; index++) {
        let base = headerText(headerRow[index]);
        if (!base) {
            if (dataRows.every(row => isEmptyCell(row[index]))) continue;
            base = `Column${index + 1}`;
        }
        if (isPrototypePollutingKey(base)) {
            console.warn(`Skipping column "${base}": a header may not reach the prototype chain`);
            continue;
        }
        let name = base;
        for (let n = 1; used.has(name); n++) name = `${base}_${n}`;
        used.add(name);
        byColumn.set(index, name);
        order.push(name);
    }

    return { byColumn, order };
}

/**
 * Turn a sheet's rows into one object per record, keyed by the header row.
 *
 * The header row is the first row with anything in it, so a table that starts
 * lower down the sheet reads as it did with SheetJS. A wholly empty row is not a
 * record, and an empty cell contributes no key: the import treats "absent" and
 * "blank" differently, and only an absent key leaves a collection's default value
 * in place.
 */
export function sheetRowsToObjects(rows: ReadonlyArray<readonly SheetCell[]>): {
    headers: string[];
    data: Record<string, SheetCell>[];
} {
    const hasContent = (row: readonly SheetCell[]) => row.some(cell => !isEmptyCell(cell));
    const start = rows.findIndex(hasContent);
    if (start === -1) return { headers: [], data: [] };

    const dataRows = rows.slice(start + 1).filter(hasContent);
    const headers = getWorksheetHeaders(rows[start], dataRows);

    const data = dataRows.map(row => {
        const obj: Record<string, SheetCell> = {};
        row.forEach((cell, index) => {
            if (isEmptyCell(cell)) return;
            const header = headers.byColumn.get(index);
            if (header !== undefined) obj[header] = cell;
        });
        return obj;
    });

    return { headers: headers.order, data };
}
