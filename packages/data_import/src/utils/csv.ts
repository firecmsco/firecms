import { isPrototypePollutingKey } from "./prototype_keys";

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
        if (char === "\r") {
            // CRLF: the line ends on the \n. A lone CR outside quotes is dropped.
            i++;
            continue;
        }
        if (char === "\n") {
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
        const count = parseCsvRows(sample, candidate)[0]?.length ?? 0;
        if (count > bestCount) {
            best = candidate;
            bestCount = count;
        }
    }
    return best;
}

export interface ParsedCsv {
    headers: string[];
    data: Record<string, string>[];
}

/**
 * Parse CSV text into one object per row, keyed by the header row.
 *
 * A blank header keeps its column rather than collapsing it, so the cells to its
 * right stay under their own names.
 */
export function parseCsvToObjects(text: string): ParsedCsv {
    // A BOM is one character of the first header, and Excel writes one.
    const cleaned = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
    const delimiter = detectCsvDelimiter(cleaned);
    const rows = parseCsvRows(cleaned, delimiter)
        .filter(row => row.some(cell => cell.trim() !== ""));

    if (rows.length === 0) {
        return { headers: [], data: [] };
    }

    const headers = rows[0].map((header, index) => header.trim() || `Column${index + 1}`);

    const data = rows.slice(1).map((cells) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
            // The header row is uploaded data: `obj["__proto__"] = …` is the
            // prototype setter, not a column. Refused, as elsewhere in import.
            if (isPrototypePollutingKey(header)) return;
            const cell = cells[index];
            if (cell === undefined) return;
            obj[header] = cell;
        });
        return obj;
    });

    return { headers, data };
}
