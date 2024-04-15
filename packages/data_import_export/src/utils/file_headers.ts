import * as XLSX from "xlsx";
export function getXLSXHeaders(sheet: any) {
    let header = 0; let offset = 1;
    const hdr = [];
    const o:any = {};
    if (sheet == null || sheet["!ref"] == null) return [];
    const range = o.range !== undefined ? o.range : sheet["!ref"];
    let r;
    if (o.header === 1) header = 1;
    else if (o.header === "A") header = 2;
    else if (Array.isArray(o.header)) header = 3;
    switch (typeof range) {
        case "string":
            r = safeDecodeRange(range);
            break;
        case "number":
            r = safeDecodeRange(sheet["!ref"]);
            r.s.r = range;
            break;
        default:
            r = range;
    }
    if (header > 0) offset = 0;
    const rr = XLSX.utils.encode_row(r.s.r);
    const cols = new Array(r.e.c - r.s.c + 1);
    for (let C = r.s.c; C <= r.e.c; ++C) {
        cols[C] = XLSX.utils.encode_col(C);
        const val = sheet[cols[C] + rr];
        switch (header) {
            case 1:
                hdr.push(C);
                break;
            case 2:
                hdr.push(cols[C]);
                break;
            case 3:
                hdr.push(o.header[C - r.s.c]);
                break;
            default:
                if (val === undefined) continue;
                hdr.push(XLSX.utils.format_cell(val));
        }
    }
    return hdr;
}

function safeDecodeRange(range:any) {
    const o = {
        s: {
            c: 0,
            r: 0
        },
        e: {
            c: 0,
            r: 0
        }
    };
    let idx = 0; let i = 0; let cc = 0;
    const len = range.length;
    for (idx = 0; i < len; ++i) {
        if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
        idx = 26 * idx + cc;
    }
    o.s.c = --idx;

    for (idx = 0; i < len; ++i) {
        if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) break;
        idx = 10 * idx + cc;
    }
    o.s.r = --idx;

    if (i === len || range.charCodeAt(++i) === 58) {
        o.e.c = o.s.c;
        o.e.r = o.s.r;
        return o;
    }

    for (idx = 0; i !== len; ++i) {
        if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
        idx = 26 * idx + cc;
    }
    o.e.c = --idx;

    for (idx = 0; i !== len; ++i) {
        if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) break;
        idx = 10 * idx + cc;
    }
    o.e.r = --idx;
    return o;
}
