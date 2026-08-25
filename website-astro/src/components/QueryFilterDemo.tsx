import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * Asking a question across a Firestore collection.
 *
 * This is the action /firestore-gui argues Firestore has no client for: the
 * console shows one document at a time and cannot filter across a collection,
 * so the work leaks into one-off Node scripts. Chrome and table geometry come
 * from the app — see ProductsCollectionDemo. Keep it matching the product.
 *
 * Autoplay only — no pointer events.
 */

const STORAGE = "https://firebasestorage.googleapis.com/v0/b/firecms-demo-27150.appspot.com/o/dadaki%2F";
const img = (file: string, token: string) => `${STORAGE}${file}?alt=media&token=${token}`;

type Chip = { label: string; bg: string; fg: string };

type Row = {
    id: string;
    name: string;
    image: string;
    category: Chip;
    available: boolean;
    price: number | null;
};

const ROWS: Row[] = [
    {
        id: "B000P0MDMS",
        name: "Baseball Cap",
        image: img("B000P0MDMS-576916726.jpg", "e7091ba7-39fd-43e5-ac3b-230e03f91532"),
        category: { label: "Clothing man", bg: "rgb(102, 102, 102)", fg: "rgb(255, 255, 255)" },
        available: true,
        price: 23.99
    },
    {
        id: "B000UO4KXY",
        name: "Conceal invisible shelf",
        image: img("B000UO4KXY-825906283.jpg", "ab3371da-0801-466c-b980-bd52a91d40d0"),
        category: { label: "Home storage", bg: "rgb(204, 204, 204)", fg: "rgb(4, 4, 4)" },
        available: true,
        price: 225
    },
    {
        id: "B000ZHY0JK",
        name: "Aviator RB 3025",
        image: img("B000ZHY0JK-2047853797.jpg", "9e609a03-5866-4bd3-919b-7f40e599f7e0"),
        category: { label: "Sunglasses", bg: "rgb(255, 220, 229)", fg: "rgb(76, 12, 28)" },
        available: true,
        price: 115
    },
    {
        id: "B0017TNJWY",
        name: "Wine decanter",
        image: img("B0017TNJWY-528977189.jpg", "690f494a-6a01-4bed-a9da-c9d61ddac4d6"),
        category: { label: "Serveware", bg: "rgb(139, 70, 255)", fg: "rgb(255, 255, 255)" },
        available: false,
        price: null
    },
    {
        id: "B001A793IW",
        name: "Wobble Chess Set Walnut",
        image: img("B001A793IW-400375460.jpg", "4697b281-c0c2-486b-b986-3f2838f81037"),
        category: { label: "Toys and games", bg: "rgb(11, 118, 183)", fg: "rgb(208, 240, 253)" },
        available: true,
        price: 99
    }
];

const COLS = [
    { key: "name", label: "Name", w: 200, icon: "short_text", justify: "left" },
    { key: "image", label: "Image", w: 120, icon: "upload_file", justify: "left" },
    { key: "category", label: "Category", w: 155, icon: "list", justify: "left" },
    { key: "available", label: "Available", w: 110, icon: "flag", justify: "center" },
    { key: "price", label: "Price", w: 165, icon: "numbers", justify: "right" }
] as const;

type Filter = { col: string; label: string; op: string; value: string };

/**
 * Each beat is a state of the query. `count` is what the collection returns for
 * that query — the five visible rows are one page of it.
 */
type Beat = {
    filters: Filter[];
    sort: { col: string; dir: "asc" | "desc" } | null;
    count: number;
    /** An open filter popover, mid-build. */
    building: { col: string; label: string; op: string; options: string[]; chosen: number } | null;
    keep: (r: Row) => boolean;
    caption: string;
};

const F_AVAILABLE: Filter = { col: "available", label: "Available", op: "==", value: "true" };
const F_PRICE: Filter = { col: "price", label: "Price", op: ">", value: "100" };

const BEATS: Beat[] = [
    {
        filters: [], sort: null, count: 256, building: null,
        keep: () => true,
        caption: "256 products. The console would show you them one document at a time."
    },
    {
        filters: [], sort: null, count: 256,
        building: { col: "available", label: "Available", op: "equals", options: ["true", "false"], chosen: 0 },
        keep: () => true,
        caption: "Pick a field, an operator and a value."
    },
    {
        filters: [F_AVAILABLE], sort: null, count: 187, building: null,
        keep: r => r.available,
        caption: "187 in stock."
    },
    {
        filters: [F_AVAILABLE], sort: null, count: 187,
        building: { col: "price", label: "Price", op: "greater than", options: ["50", "100", "200"], chosen: 1 },
        keep: r => r.available,
        caption: "Filters stack, the way a Firestore query does."
    },
    {
        filters: [F_AVAILABLE, F_PRICE], sort: null, count: 41,
        building: null,
        keep: r => r.available && (r.price ?? 0) > 100,
        caption: "41 available products over €100 — a question, answered in the UI."
    },
    {
        filters: [F_AVAILABLE, F_PRICE], sort: { col: "price", dir: "asc" }, count: 41,
        building: null,
        keep: r => r.available && (r.price ?? 0) > 100,
        caption: "Sorted by price. Queries respect your Firestore indexes."
    }
];

function MIcon({ name, size = 20, className = "", style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
    return (
        <span className={"material-icons select-none " + className}
              style={{ fontSize: `${size}px`, verticalAlign: "middle", ...style }}>
            {name}
        </span>
    );
}

function Switch({ on }: { on: boolean }) {
    return (
        <span className={
            "w-[38px] h-[22px] min-w-[38px] min-h-[22px] rounded-full relative shadow-sm inline-block ring-1 " +
            (on ? "ring-secondary bg-secondary" : "bg-surface-accent-900 ring-surface-accent-700")
        }>
            <span className={
                "block rounded-full transition-transform duration-100 ease-out w-[19px] h-[19px] mt-[1.5px] " +
                (on ? "bg-white shadow translate-x-[17px]" : "bg-surface-accent-400 shadow-sm translate-x-[2px]")
            }/>
        </span>
    );
}

/** Counts up or down so the result count reads as a query re-running. */
function useCounter(target: number, active: boolean) {
    const [n, setN] = useState(target);
    const raf = useRef<number | null>(null);
    useEffect(() => {
        if (!active) { setN(target); return; }
        const from = n;
        if (from === target) return;
        const start = performance.now();
        const DUR = 420;
        const tick = (t: number) => {
            const p = Math.min(1, (t - start) / DUR);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(from + (target - from) * eased));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);

        // requestAnimationFrame is paused while the tab is hidden, which would
        // otherwise leave the count frozen on a stale number when the reader
        // comes back. Guarantee it lands on the target either way.
        const settle = setTimeout(() => setN(target), DUR + 80);

        return () => {
            if (raf.current) cancelAnimationFrame(raf.current);
            clearTimeout(settle);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, active]);
    return n;
}

export default function QueryFilterDemo({ height = 624 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [step, setStep] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const beat = BEATS[step % BEATS.length];

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        timer.current = setTimeout(() => setStep(s => s + 1), beat.building ? 1900 : 2600);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [step, inView, beat.building]);

    const count = useCounter(beat.count, inView);

    let visible = ROWS.filter(beat.keep);
    if (beat.sort?.col === "price") {
        visible = [...visible].sort((a, b) =>
            beat.sort!.dir === "asc" ? (a.price ?? 0) - (b.price ?? 0) : (b.price ?? 0) - (a.price ?? 0));
    }

    return (
        <div ref={ref} className="w-full select-none">
            <div
                className="relative flex w-full overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 text-white"
                style={{ height }}
                aria-label="Building a filtered, sorted query over a Firestore products collection and watching the result count change"
            >
                {/* Nav rail */}
                <div className="hidden w-[72px] min-w-[72px] shrink-0 flex-col border-r border-surface-700/40 bg-surface-900 sm:flex">
                    <div className="flex h-[56px] shrink-0 items-center justify-center">
                        <svg width="26" height="26" viewBox="0 0 583 583" fill="none" aria-hidden="true">
                            <circle cx="291.5" cy="291.5" r="291.5" fill="#0070F4"/>
                            <ellipse cx="292" cy="291.5" rx="173" ry="173.5" fill="#FF3773"/>
                            <path d="M465 291.5C465 268.847 460.525 246.416 451.831 225.487C443.137 204.558 430.394 185.542 414.329 169.524C398.265 153.506 379.194 140.8 358.204 132.131C337.215 123.462 314.719 119 292 119C269.281 119 246.785 123.462 225.796 132.131C204.806 140.8 185.735 153.506 169.671 169.524C153.606 185.542 140.863 204.558 132.169 225.487C123.475 246.416 119 268.847 119 291.5L292 291.5H465Z" fill="#FFA400"/>
                        </svg>
                    </div>
                    <div className="flex-grow px-2">
                        {[["article", false], ["shopping_cart", true], ["person", false], ["confirmation_number", false], ["insert_drive_file", false]].map(([icon, active], i) => (
                            <div key={i} className={"mx-2 my-1 flex h-[30px] items-center rounded-lg " + (active ? "bg-primary/10" : "")}>
                                <div className={"flex h-[30px] w-[44px] shrink-0 items-center justify-center " + (active ? "text-primary" : "text-text-secondary-dark")}>
                                    <MIcon name={icon as string} size={18}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Top bar */}
                    <div className="flex h-16 shrink-0 items-center gap-2 px-4">
                        <h6 className="truncate text-[15px] font-medium text-white">My demo app</h6>
                        <p className="text-[12px] text-text-secondary-dark">/</p>
                        <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                            <p className="text-[13px] text-white">Products</p>
                            <span className="rounded bg-surface-700 px-1.5 py-0 text-xs tabular-nums text-surface-accent-400">
                                {count}
                            </span>
                        </div>
                        <div className="flex-grow"/>
                        <MIcon name="dark_mode" className="text-surface-accent-300"/>
                        <span className="ml-1 h-8 w-8 rounded-full bg-surface-accent-800"/>
                    </div>

                    <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-surface-700/40">
                        {/* Toolbar with live filter chips */}
                        <div className="relative flex min-h-[52px] shrink-0 flex-row items-center justify-between gap-3 border-b border-surface-700/40 bg-surface-900 px-4">
                            <div className="flex min-w-0 items-center gap-1.5">
                                <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-surface-700 px-2 py-1 text-text-primary-dark">
                                    <MIcon name="list"/>
                                    <span className="ml-1 text-sm">List</span>
                                </span>
                                <span className={
                                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 transition-colors duration-300 " +
                                    (beat.filters.length || beat.building ? "bg-primary/15 text-primary" : "text-text-primary-dark")
                                }>
                                    <MIcon name="filter_list" className={beat.filters.length || beat.building ? "text-primary" : "text-surface-accent-300"}/>
                                    <span className="text-sm">Filters</span>
                                </span>

                                {/* Applied filters */}
                                {beat.filters.map(f => (
                                    <span key={f.col}
                                          className="filter-chip inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 py-1 pl-2.5 pr-1.5 text-[12.5px] text-white">
                                        <span className="text-surface-300">{f.label}</span>
                                        <span className="font-mono text-primary">{f.op}</span>
                                        <span className="font-medium">{f.value}</span>
                                        <MIcon name="close" size={14} className="text-surface-500"/>
                                    </span>
                                ))}
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                                <MIcon name="download" className="mx-1 text-surface-accent-300"/>
                                <span className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-white">
                                    <MIcon name="add"/>
                                    Add Product
                                </span>
                            </div>

                            {/* Filter popover, mid-build */}
                            {beat.building && (
                                <div className="popover absolute left-[86px] top-[46px] z-30 w-[268px] overflow-hidden rounded-xl border border-surface-700 bg-surface-800 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
                                    <div className="flex items-center gap-2 border-b border-surface-700/60 px-3 py-2.5">
                                        <MIcon name="filter_list" size={16} className="text-primary"/>
                                        <span className="text-[13px] font-medium text-white">{beat.building.label}</span>
                                    </div>
                                    <div className="px-3 py-2.5">
                                        <div className="mb-2 flex items-center justify-between rounded-md border border-surface-700 bg-surface-900 px-2.5 py-1.5">
                                            <span className="text-[12.5px] text-surface-300">{beat.building.op}</span>
                                            <MIcon name="expand_more" size={16} className="text-surface-500"/>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {beat.building.options.map((o, i) => (
                                                <span key={o} className={
                                                    "flex items-center justify-between rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors duration-200 " +
                                                    (i === beat.building!.chosen ? "bg-primary/20 text-white" : "text-surface-400")
                                                }>
                                                    <span className="font-mono">{o}</span>
                                                    {i === beat.building!.chosen && <MIcon name="check" size={15} className="text-primary"/>}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-950">
                            <div className="flex h-12 w-fit min-w-full flex-row border-b border-surface-800/40 bg-surface-900">
                                {COLS.map(c => {
                                    const sorted = beat.sort?.col === c.key;
                                    return (
                                        <div key={c.key} className="h-full flex-shrink-0" style={{ minWidth: c.w, maxWidth: c.w, width: c.w }}>
                                            <div className={"flex h-full items-center gap-1.5 px-3 text-xs font-semibold uppercase " + (sorted ? "text-primary" : "text-text-secondary-dark")}>
                                                {c.icon && <MIcon name={c.icon} size={16} className={sorted ? "text-primary" : "text-surface-accent-500"}/>}
                                                <span className="truncate">{c.label}</span>
                                                <span className="transition-opacity duration-300" style={{ opacity: sorted ? 1 : 0 }}>
                                                    <MIcon name={beat.sort?.dir === "asc" ? "arrow_upward" : "arrow_downward"} size={14} className="text-primary"/>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col">
                                {visible.map(r => (
                                    <div key={r.id}
                                         className="row flex w-fit min-w-full flex-row items-center border-b border-surface-800/40"
                                         style={{ height: 84 }}>
                                        {COLS.map(c => {
                                            const base = "flex h-full items-center px-3 flex-shrink-0";
                                            const style = { minWidth: c.w, maxWidth: c.w, width: c.w,
                                                justifyContent: c.justify === "center" ? "center" : c.justify === "right" ? "flex-end" : "flex-start" } as React.CSSProperties;
                                            if (c.key === "name")
                                                return <div key={c.key} className={base} style={style}>
                                                    <span className="truncate text-[13.5px] text-white">{r.name}</span></div>;
                                            if (c.key === "image")
                                                return <div key={c.key} className={base} style={style}>
                                                    <img src={r.image} alt="" loading="lazy" width={60} height={60}
                                                         className="h-[60px] w-[60px] rounded-md object-cover"/></div>;
                                            if (c.key === "category")
                                                return <div key={c.key} className={base} style={style}>
                                                    <span className="truncate rounded-lg px-2 py-1 text-[13px]"
                                                          style={{ backgroundColor: r.category.bg, color: r.category.fg }}>
                                                        {r.category.label}</span></div>;
                                            if (c.key === "available")
                                                return <div key={c.key} className={base} style={style}><Switch on={r.available}/></div>;
                                            return (
                                                <div key={c.key} className={base} style={style}>
                                                    {r.price !== null
                                                        ? <span className="text-[13.5px] tabular-nums text-white">{r.price.toFixed(2)}
                                                            <span className="ml-1 text-surface-500">EUR</span></span>
                                                        : <span className="text-[13px] text-surface-600">—</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}

                                <div className="flex-grow"/>

                                <div className="flex shrink-0 items-center justify-between border-t border-surface-800/40 bg-surface-900/60 px-4 py-2.5 text-[12px] text-surface-500">
                                    <span className="tabular-nums">
                                        Showing <span className="text-surface-300">{visible.length}</span> of{" "}
                                        <span className="text-surface-300">{count}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MIcon name="bolt" size={14} className="text-surface-600"/>
                                        Served from your Firestore indexes
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-4 min-h-[24px] text-sm text-surface-400">{beat.caption}</p>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .row { animation: qfd-row 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                    .filter-chip { animation: qfd-chip 280ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                    .popover { animation: qfd-pop 200ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                }
                @keyframes qfd-row  { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
                @keyframes qfd-chip { from { opacity: 0; transform: scale(0.9); }        to { opacity: 1; transform: none; } }
                @keyframes qfd-pop  { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: none; } }
            `}</style>
        </div>
    );
}
