import { sheetRowsToObjects, type SheetCell } from "./file_headers";
import { parseCsvToObjects } from "./csv";
import { mapJsonParse, unflattenObject } from "./transforms";

// Part of this package's public API since before it moved to ./transforms.
export { unflattenObject };

type ConversionResult = {
    data: object[];
    propertiesOrder: string[]
}

/** One entry per sheet, as `read-excel-file`'s default export returns them. */
type SheetEntry = { sheet: string; data: SheetCell[][] };
type ReadXlsxFile = (input: File | Blob | ArrayBuffer) => Promise<SheetEntry[]>;

let xlsxReader: Promise<ReadXlsxFile> | undefined;

/**
 * The workbook reader, fetched the first time somebody opens a workbook: a static
 * import would put it on the startup path of every FireCMS app, because
 * `@firecms/cloud` reaches this module through its barrel.
 *
 * `read-excel-file` rather than SheetJS `xlsx`: SheetJS publishes current releases
 * only on its own CDN, so as a dependency it was a URL, and npm 12
 * (`allow-remote=none`) and pnpm 11 (`blockExoticSubdeps`) refuse URL-resolved
 * packages by default. Every FireCMS app installs this package through
 * @firecms/firebase, so no new project could install with either. Nothing here
 * writes a workbook; this is the one place that reads one.
 */
function loadXlsxReader(): Promise<ReadXlsxFile> {
    // `/browser`, not the bare package name: `read-excel-file` publishes no root
    // export, only `./browser`, `./universal`, `./node` and `./web-worker`. The
    // browser entry takes the ArrayBuffer the FileReader below produces.
    xlsxReader ??= import("read-excel-file/browser").then(mod => {
        const candidate = (mod as { default?: unknown }).default ?? mod;
        // `default.default` under some interop paths: unwrap one more level rather
        // than call a namespace object and fail at the moment a user picks a file,
        // which is the only moment this code runs.
        const fn = typeof candidate === "function"
            ? candidate
            : (candidate as { default?: unknown })?.default;
        if (typeof fn !== "function") throw new Error("read-excel-file did not resolve to a function");
        return fn as ReadXlsxFile;
    });
    return xlsxReader;
}

/**
 * read-excel-file turns Excel's date serials (fractional days) into milliseconds
 * with `Math.floor`, and the fraction is rarely exact in floating point: a time of
 * 12:30:00 arrives as 12:29:59.999, and a CMS showing minutes would display 12:29.
 * A date within a millisecond of a whole second is put back on it; a genuine
 * sub-second value is left alone.
 */
function snapToSecond(date: Date): Date {
    const time = date.getTime();
    const second = Math.round(time / 1000) * 1000;
    return Math.abs(time - second) <= 1 ? new Date(second) : date;
}

/**
 * Excel stores a date as a wall-clock reading with no time zone: a cell showing
 * 2024-01-15 means that day wherever the file is opened. read-excel-file hands the
 * reading over as UTC, which is 19:00 the day before in New York, and FireCMS shows
 * dates in the viewer's zone: every date-only cell imported a day early west of
 * UTC. The same reading is rebuilt in local time, which is what SheetJS returned.
 */
function utcReadingToLocal(date: Date): Date {
    // setFullYear rather than the constructor, which maps years 0-99 to 1900-1999.
    const local = new Date(0);
    local.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    local.setHours(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
    return local;
}

function xlsxCell(cell: SheetCell): SheetCell {
    return cell instanceof Date ? utcReadingToLocal(snapToSecond(cell)) : cell;
}

// Said, rather than opening the mapping step with nothing in it.
const NO_ROWS = "The file has a header row but no rows under it";

function isCsvFile(file: File): boolean {
    const name = (file.name ?? "").toLowerCase();
    if (name.endsWith(".csv") || name.endsWith(".tsv")) return true;
    return file.type === "text/csv" || file.type === "application/csv";
}

function toImportRows(rows: Array<Record<string, unknown>>): object[] {
    return rows.map(mapJsonParse).map(unflattenObject);
}

export function convertFileToJson(file: File): Promise<ConversionResult> {
    return new Promise((resolve, reject) => {
        if (isCsvFile(file)) {
            console.debug("Converting CSV file to JSON", file.name);
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const { headers, data } = parseCsvToObjects(e.target?.result as string);
                    if (headers.length === 0) {
                        reject(new Error("The CSV file is empty"));
                        return;
                    }
                    if (data.length === 0) {
                        reject(new Error(NO_ROWS));
                        return;
                    }
                    resolve({
                        data: toImportRows(data),
                        propertiesOrder: headers
                    });
                } catch (err) {
                    console.error("Error parsing CSV file", err);
                    reject(err);
                }
            };
            reader.onerror = () => reject(reader.error ?? new Error("Could not read the file"));
            // Explicit UTF-8: the browser's default guess mangles accented and CJK text.
            reader.readAsText(file, "utf-8");
        } else if (file.type === "application/json") {
            console.debug("Converting JSON file to JSON", file.name);
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = e.target?.result as string;
                    const jsonData = JSON.parse(data);
                    if (!Array.isArray(jsonData)) {
                        reject(new Error("JSON file should contain an array of objects"));
                    } else {
                        // Assuming all objects in the array have the same structure/order
                        const propertiesOrder = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
                        resolve({
                            data: jsonData,
                            propertiesOrder
                        });
                    }
                } catch (e) {
                    console.error("Error parsing JSON file", e);
                    reject(e);
                }
            };
            reader.readAsText(file);
        } else {
            console.debug("Converting Excel file to JSON", file.name);
            const reader = new FileReader();
            reader.onload = async function (e) {
                try {
                    const buffer = e.target?.result as ArrayBuffer;
                    // Every .xlsx is a zip, and its first two bytes say so. Anything
                    // else (a legacy .xls, a CSV renamed .xlsx) is refused by name
                    // here, because what the reader says about it is a stack trace
                    // from inside its own unzipper.
                    const magic = new Uint8Array(buffer, 0, Math.min(2, buffer.byteLength));
                    if (magic[0] !== 0x50 || magic[1] !== 0x4b) {
                        reject(new Error(
                            `'${file.name}' is not a readable .xlsx workbook. `
                            + "Export it again as .xlsx, or save it as .csv."
                        ));
                        return;
                    }

                    const readXlsxFile = await loadXlsxReader();
                    let sheets: SheetEntry[];
                    try {
                        sheets = await readXlsxFile(buffer);
                    } catch (readError) {
                        // A workbook with zero sheets throws from inside the reader
                        // rather than returning an empty list. The file is a valid zip
                        // (checked above), so the honest reading is that there is
                        // nothing in it to import.
                        console.debug("Spreadsheet reader failed", readError);
                        reject(new Error(
                            "No worksheets found in file — it has no sheets, or none this reader can open."
                        ));
                        return;
                    }

                    const firstSheet = sheets[0];
                    if (!firstSheet) {
                        reject(new Error("No worksheets found in file"));
                        return;
                    }

                    const { headers, data } = sheetRowsToObjects(firstSheet.data.map(row => row.map(xlsxCell)));
                    if (headers.length === 0) {
                        reject(new Error("The spreadsheet is empty"));
                        return;
                    }
                    if (data.length === 0) {
                        reject(new Error(NO_ROWS));
                        return;
                    }

                    resolve({
                        data: toImportRows(data),
                        propertiesOrder: headers
                    });
                } catch (err) {
                    console.error("Error parsing Excel file", err);
                    reject(err);
                }
            };
            reader.onerror = () => reject(reader.error ?? new Error("Could not read the file"));
            reader.readAsArrayBuffer(file);
        }
    });
}
