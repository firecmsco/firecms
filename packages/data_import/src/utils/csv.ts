import { sheetRowsToObjects, type SheetCell } from "./file_headers";

/**
 * Delimiters sniffed from the header row, most common first.
 *
 * A spreadsheet saved as "CSV" in a locale that uses the comma as a decimal
 * separator is semicolon-delimited, and a tab-separated file saved as `.csv`
 * happens often enough to be worth reading.
 */
const CANDIDATE_DELIMITERS = [",", ";", "\t"];

/**
 * Split CSV text into rows of raw cells, RFC 4180 style.
 *
 * Quoted fields may contain the delimiter, newlines and doubled quotes; this is
 * the inverse of what the export's `entryToCSVRow` writes (every cell quoted,
 * quotes doubled, CRLF line ends), so an exported file reads back into the cells
 * it was built from.
 */
export function parseCsvRows(text: string, delimiter = ","): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let quoted = false;
    let inQuotes = false;
    let i = 0;

    const endField = () => {
        row.push(field);
        field = "";
        quoted = false;
    };

    while (i < text.length) {
        const char = text[i];

        if (inQuotes) {
            if (char === "\"") {
                // A doubled quote is a literal one; a single quote closes the field.
                if (text[i + 1] === "\"") {
                    field += "\"";
                    i += 2;
                    continue;
                }
                inQuotes = false;
                i++;
                continue;
            }
            field += char;
            i++;
            continue;
        }

        if (char === "\"" && field === "") {
            inQuotes = true;
            quoted = true;
            i++;
            continue;
        }
        if (char === delimiter) {
            endField();
            i++;
            continue;
        }
        if (char === "\r" && text[i + 1] === "\n") {
            // CRLF: the line ends on the \n.
            i++;
            continue;
        }
        // A lone CR ends a line too: Excel for Mac's "Macintosh Comma Separated"
        // writes nothing else, and dropping it read the whole file as one row.
        if (char === "\n" || char === "\r") {
            endField();
            rows.push(row);
            row = [];
            i++;
            continue;
        }
        field += char;
        i++;
    }

    // A file that does not end in a newline still has a last row.
    if (field !== "" || quoted || row.length > 0) {
        endField();
        rows.push(row);
    }

    return rows;
}

/**
 * Pick the delimiter that splits the header row into the most cells. A
 * single-column file matches nothing and stays on the comma.
 */
export function detectCsvDelimiter(text: string): string {
    const sample = text.slice(0, 64 * 1024);
    let best = CANDIDATE_DELIMITERS[0];
    let bestCount = 1;
    for (const candidate of CANDIDATE_DELIMITERS) {
        // The header row, which is the first row with anything in it.
        const count = parseCsvRows(sample, candidate)
            .find(row => row.some(cell => cell.trim() !== ""))?.length ?? 0;
        if (count > bestCount) {
            best = candidate;
            bestCount = count;
        }
    }
    return best;
}

export interface ParsedCsv {
    headers: string[];
    data: Record<string, SheetCell>[];
}

/**
 * Type one CSV value the way a spreadsheet cell arrives from the .xlsx reader.
 *
 * `TRUE` and `FALSE` in any case become booleans: Excel and Google Sheets write
 * them in capitals, which the later JSON parse (lower case only) misses, and a
 * boolean property compared the text against "true", importing every TRUE as
 * false. Numbers and JSON are parsed later, by `mapJsonParse`; a date stays text
 * until the target property says it is one, so a text column keeps it as written.
 */
function typeCsvValue(value: string): SheetCell {
    const lower = value.trim().toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
    return value;
}

/**
 * Parse CSV text into one object per row, keyed by the header row.
 *
 * A blank cell (or one holding only spaces) is left out of its row, like an empty
 * spreadsheet cell and as SheetJS did. As `""` it became 0, false, an Invalid Date
 * or a reference to "" (which fails the whole save) once mapped, and replaced the
 * collection's defaults; FireCMS's own export writes every null as a blank cell.
 * Header naming (blank and repeated headers) is shared with the .xlsx reader.
 */
export function parseCsvToObjects(text: string): ParsedCsv {
    // A BOM is one character of the first header, and Excel writes one.
    const cleaned = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
    const delimiter = detectCsvDelimiter(cleaned);
    const rows = parseCsvRows(cleaned, delimiter)
        .map(row => row.map(cell => cell.trim() === "" ? null : cell));

    const { headers, data } = sheetRowsToObjects(rows);
    return {
        headers,
        data: data.map(row => {
            const typed: Record<string, SheetCell> = {};
            for (const [key, value] of Object.entries(row)) {
                typed[key] = typeof value === "string" ? typeCsvValue(value) : value;
            }
            return typed;
        })
    };
}
