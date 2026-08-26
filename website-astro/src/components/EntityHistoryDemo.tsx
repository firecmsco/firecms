import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * Entity revisions and the audit log — a FireCMS PRO feature.
 *
 * Replaces /img/history.png, a January screenshot. Chrome, chips and switch
 * geometry follow ProductsCollectionDemo, which was reconstructed from the
 * running app's DOM. Keep it matching the product.
 *
 * Autoplay only — no pointer events.
 */

type Change = { field: string; from: string | null; to: string | null };

type Revision = {
    id: string;
    who: string;
    initials: string;
    tint: string;
    when: string;
    summary: string;
    changes: Change[];
};

const REVISIONS: Revision[] = [
    {
        id: "rev_8f2a",
        who: "marta@yourteam.com",
        initials: "MR",
        tint: "rgb(6, 160, 155)",
        when: "today, 14:12",
        summary: "Updated price and availability",
        changes: [
            { field: "price", from: "129.00", to: "115.00" },
            { field: "available", from: "false", to: "true" }
        ]
    },
    {
        id: "rev_5c31",
        who: "sam@yourteam.com",
        initials: "SK",
        tint: "rgb(139, 70, 255)",
        when: "yesterday, 09:41",
        summary: "Rewrote the description",
        changes: [
            { field: "description", from: "Unisex sunglasses, gold frame.", to: "Unisex Sunglasses, Gold, 58 mm. Iconic, timeless style." }
        ]
    },
    {
        id: "rev_1b90",
        who: "you@yourteam.com",
        initials: "YT",
        tint: "rgb(45, 127, 249)",
        when: "12 Aug, 17:03",
        summary: "Moved category, added a brand",
        changes: [
            { field: "category", from: "Accessories", to: "Sunglasses" },
            { field: "brand", from: null, to: "Ray-Ban" }
        ]
    },
    {
        id: "rev_0a44",
        who: "import@firecms",
        initials: "IM",
        tint: "rgb(102, 102, 102)",
        when: "12 Aug, 16:58",
        summary: "Document created by CSV import",
        changes: [
            { field: "name", from: null, to: "Aviator RB 3025" },
            { field: "price", from: null, to: "129.00" }
        ]
    }
];

function MIcon({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
    return (
        <span className={"material-icons select-none " + className}
              style={{ fontSize: `${size}px`, verticalAlign: "middle" }}>{name}</span>
    );
}

function Value({ v, kind }: { v: string | null; kind: "from" | "to" }) {
    if (v === null) {
        return <span className="text-[12px] italic text-surface-600">not set</span>;
    }
    const tone = kind === "from"
        ? "border-rose-500/25 bg-rose-500/10 text-rose-200/90 line-through decoration-rose-400/40"
        : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/90";
    return (
        <span className={"inline-block max-w-full truncate rounded border px-1.5 py-0.5 font-mono text-[12px] " + tone}>
            {v}
        </span>
    );
}

export default function EntityHistoryDemo({ height = 480 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [i, setI] = useState(0);
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
        t.current = setTimeout(() => setI(v => (v + 1) % REVISIONS.length), 3200);
        return () => { if (t.current) clearTimeout(t.current); };
    }, [i, inView]);

    const rev = REVISIONS[i];

    return (
        <div
            ref={ref}
            className="flex w-full select-none overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 text-white"
            style={{ height }}
            aria-label="The FireCMS entity history panel: a list of revisions to a Firestore document, with the field-level changes for the selected one"
        >
            {/* Revision list */}
            <div className="flex w-[286px] min-w-[286px] shrink-0 flex-col border-r border-surface-700/40 bg-surface-950/60">
                <div className="flex h-[46px] shrink-0 items-center gap-2 border-b border-surface-700/40 px-4">
                    <MIcon name="history" size={17} className="text-surface-accent-400"/>
                    <span className="text-[13px] font-medium text-surface-200">Revisions</span>
                    <span className="ml-auto rounded bg-surface-800 px-1.5 text-[11px] tabular-nums text-surface-accent-400">
                        {REVISIONS.length}
                    </span>
                </div>

                <div className="flex-1 overflow-hidden py-1.5">
                    {REVISIONS.map((r, idx) => {
                        const on = idx === i;
                        return (
                            <div key={r.id}
                                 className={
                                     "relative mx-1.5 mb-0.5 flex gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-200 " +
                                     (on ? "bg-primary/10" : "")
                                 }>
                                {on && <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r bg-primary"/>}
                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9.5px] font-semibold text-white"
                                      style={{ backgroundColor: r.tint }}>
                                    {r.initials}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className={"block truncate text-[12.5px] leading-tight " + (on ? "text-white" : "text-surface-300")}>
                                        {r.summary}
                                    </span>
                                    <span className="mt-0.5 block truncate text-[11px] leading-tight text-surface-600">
                                        {r.who} · {r.when}
                                    </span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Diff */}
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex h-[46px] shrink-0 items-center gap-2 border-b border-surface-700/40 px-4">
                    <span className="text-[13px] text-surface-500">products</span>
                    <span className="text-[12px] text-surface-700">/</span>
                    <span className="font-mono text-[12.5px] text-surface-200">B000ZHY0JK</span>
                    <span className="ml-auto flex items-center gap-1.5 rounded-md border border-surface-700 px-2 py-1 text-[11.5px] text-surface-400">
                        <MIcon name="undo" size={14}/>
                        Restore this version
                    </span>
                </div>

                <div key={rev.id} className="hist-fade flex-1 overflow-hidden px-5 py-4">
                    <div className="mb-4 flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                              style={{ backgroundColor: rev.tint }}>
                            {rev.initials}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-[13px] leading-tight text-white">{rev.who}</span>
                            <span className="block truncate text-[11.5px] leading-tight text-surface-500">
                                {rev.when} · <span className="font-mono">{rev.id}</span>
                            </span>
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-surface-700/40">
                        {rev.changes.map((c, idx) => (
                            <div key={c.field}
                                 className={"px-3.5 py-2.5 " + (idx ? "border-t border-surface-800/60" : "")}>
                                <div className="mb-1.5 flex items-center gap-1.5">
                                    <MIcon name="edit" size={13} className="text-surface-600"/>
                                    <span className="font-mono text-[12px] text-surface-300">{c.field}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Value v={c.from} kind="from"/>
                                    <MIcon name="arrow_forward" size={14} className="text-surface-600"/>
                                    <Value v={c.to} kind="to"/>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-3.5 flex items-center gap-1.5 text-[11.5px] text-surface-600">
                        <MIcon name="lock" size={13}/>
                        Written to your own Firestore project, not to FireCMS.
                    </p>
                </div>
            </div>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .hist-fade { animation: eh-fade 280ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                }
                @keyframes eh-fade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
            `}</style>
        </div>
    );
}
