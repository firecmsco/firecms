import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * CSV import with column mapping and type inference — a FireCMS PRO feature.
 *
 * Replaces /img/import_mapping.webp. Chrome and chip styling follow
 * ProductsCollectionDemo, which was reconstructed from the running app's DOM.
 *
 * Autoplay only — no pointer events.
 */

type Kind = "string" | "number" | "boolean" | "reference" | "array" | "date";

const KIND_TONE: Record<Kind, string> = {
    string:    "bg-surface-700 text-surface-200",
    number:    "bg-[#2d7ff9]/15 text-[#7dabf8]",
    boolean:   "bg-[#06a09b]/15 text-[#5fd3ce]",
    reference: "bg-[#8b46ff]/15 text-[#bb9bff]",
    array:     "bg-[#ff9500]/15 text-[#ffbd57]",
    date:      "bg-[#e5484d]/15 text-[#f5878a]"
};

type Column = { csv: string; prop: string; kind: Kind; sample: string };

const COLUMNS: Column[] = [
    { csv: "sku",           prop: "id",          kind: "string",    sample: "B000ZHY0JK" },
    { csv: "product_name",  prop: "name",        kind: "string",    sample: "Aviator RB 3025" },
    { csv: "price_eur",     prop: "price",       kind: "number",    sample: "115.00" },
    { csv: "in_stock",      prop: "available",   kind: "boolean",   sample: "TRUE" },
    { csv: "category_ref",  prop: "category",    kind: "reference", sample: "categories/sunglasses" },
    { csv: "tags",          prop: "tags",        kind: "array",     sample: "unisex;gold;58mm" },
    { csv: "added_on",      prop: "createdAt",   kind: "date",      sample: "2026-02-14" }
];

const CSV_HEAD = COLUMNS.map(c => c.csv);
const CSV_ROWS = [
    ["B000ZHY0JK", "Aviator RB 3025", "115.00", "TRUE", "categories/sunglasses", "unisex;gold;58mm", "2026-02-14"],
    ["B001A793IW", "Wobble Chess Set", "99.00", "TRUE", "categories/toys", "walnut;38cm", "2026-02-14"],
    ["B000P0MDMS", "Baseball Cap", "23.99", "FALSE", "categories/clothing", "cotton;denim", "2026-02-15"]
];

function MIcon({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
    return (
        <span className={"material-icons select-none " + className}
              style={{ fontSize: `${size}px`, verticalAlign: "middle" }}>{name}</span>
    );
}

export default function ImportMappingDemo({ height = 500 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [mapped, setMapped] = useState(0);
    const t = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const HREF = "https://fonts.googleapis.com/icon?family=Material+Icons";
        if (document.querySelector(`link[href="${HREF}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = HREF;
        link.media = "print";
        link.onload = () => { link.media = "all"; };
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        if (t.current) clearTimeout(t.current);
        if (!inView) return;
        const done = mapped >= COLUMNS.length;
        t.current = setTimeout(() => setMapped(m => (m >= COLUMNS.length ? 0 : m + 1)), done ? 2400 : 620);
        return () => { if (t.current) clearTimeout(t.current); };
    }, [mapped, inView]);

    const allDone = mapped >= COLUMNS.length;

    return (
        <div
            ref={ref}
            className="flex w-full select-none flex-col overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 text-white"
            style={{ height }}
            aria-label="Importing a CSV into FireCMS: each column is matched to a Firestore property and its type is inferred"
        >
            {/* Header */}
            <div className="flex h-[50px] shrink-0 items-center gap-2.5 border-b border-surface-700/40 px-4">
                <MIcon name="upload_file" size={17} className="text-surface-accent-400"/>
                <span className="font-mono text-[12.5px] text-surface-200">products_export.csv</span>
                <span className="rounded bg-surface-800 px-1.5 text-[11px] tabular-nums text-surface-accent-400">
                    1,248 rows
                </span>
                <div className="flex-grow"/>
                <span className={
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-300 " +
                    (allDone ? "border-primary bg-primary text-white" : "border-surface-700 bg-surface-800 text-surface-600")
                }>
                    <MIcon name={allDone ? "check" : "hourglass_empty"} size={15}/>
                    Import
                </span>
            </div>

            <div className="flex min-h-0 flex-1">
                {/* Source CSV */}
                <div className="hidden w-[45%] min-w-0 shrink-0 flex-col border-r border-surface-700/40 bg-surface-950/50 md:flex">
                    <div className="px-4 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.11em] text-surface-600">
                        Source file
                    </div>
                    <div className="min-h-0 flex-1 overflow-hidden px-2 pb-2">
                        <div className="overflow-hidden rounded-lg border border-surface-800">
                            <div className="flex bg-surface-900">
                                {CSV_HEAD.map((h, ci) => (
                                    <div key={h}
                                         className={
                                             "shrink-0 truncate px-2 py-1.5 font-mono text-[10.5px] transition-colors duration-300 " +
                                             (ci < mapped ? "text-primary" : "text-surface-500")
                                         }
                                         style={{ width: 92 }}>
                                        {h}
                                    </div>
                                ))}
                            </div>
                            {CSV_ROWS.map((r, ri) => (
                                <div key={ri} className="flex border-t border-surface-800/60">
                                    {r.map((v, ci) => (
                                        <div key={ci}
                                             className="shrink-0 truncate px-2 py-1.5 font-mono text-[10.5px] text-surface-400"
                                             style={{ width: 92 }}>
                                            {v}
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div className="border-t border-surface-800/60 px-2 py-1.5 text-[10.5px] text-surface-600">
                                …1,245 more
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mapping */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-baseline gap-2 px-4 pb-1.5 pt-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-surface-600">
                            Column mapping
                        </span>
                        <span className="ml-auto text-[11px] tabular-nums text-surface-500">
                            {Math.min(mapped, COLUMNS.length)} / {COLUMNS.length}
                        </span>
                    </div>

                    <div className="min-h-0 flex-1 overflow-hidden px-3 pb-3">
                        {COLUMNS.map((c, idx) => {
                            const on = idx < mapped;
                            return (
                                <div key={c.csv}
                                     className={
                                         "mb-1 flex items-center gap-2 rounded-lg border px-2.5 py-[7px] transition-all duration-300 " +
                                         (on ? "border-surface-700/60 bg-surface-800/40" : "border-transparent opacity-35")
                                     }>
                                    <span className="w-[104px] shrink-0 truncate font-mono text-[11.5px] text-surface-400">
                                        {c.csv}
                                    </span>
                                    <MIcon name="arrow_forward" size={13}
                                           className={on ? "text-primary" : "text-surface-700"}/>
                                    <span className="w-[92px] shrink-0 truncate text-[12px] text-white">
                                        {c.prop}
                                    </span>
                                    <span className={
                                        "shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-medium transition-opacity duration-300 " +
                                        KIND_TONE[c.kind] + (on ? " opacity-100" : " opacity-0")
                                    }>
                                        {c.kind}
                                    </span>
                                    <span className="ml-auto shrink-0">
                                        <MIcon name={on ? "check_circle" : "radio_button_unchecked"} size={15}
                                               className={on ? "text-emerald-400" : "text-surface-700"}/>
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="shrink-0 border-t border-surface-700/40 px-4 py-2.5 text-[11.5px] text-surface-500">
                        {allDone
                            ? <span className="flex items-center gap-1.5 text-emerald-400/90">
                                <MIcon name="check_circle" size={14}/>
                                All columns mapped — references and arrays included.
                              </span>
                            : <span className="flex items-center gap-1.5">
                                <MIcon name="auto_awesome" size={14} className="text-surface-600"/>
                                Types inferred from the file, editable before import.
                              </span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
