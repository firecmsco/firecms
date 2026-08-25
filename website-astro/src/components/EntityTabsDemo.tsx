import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * One product document with the generated form and a custom React view mounted
 * beside it as a tab. Cycles through the tabs so the point lands without the
 * reader having to do anything: the same entity, rendered by FireCMS and then
 * rendered by your own component.
 *
 * Autoplay only — no pointer events.
 */

const TABS = ["Product", "Custom preview", "Locales"] as const;
type Tab = typeof TABS[number];

const FIELDS = [
    { label: "Name", value: "Baseball Cap", type: "String" },
    { label: "Price", value: "23.99", type: "Number" },
    { label: "Category", value: "clothing_man", type: "Enum" },
    { label: "Available", value: "true", type: "Boolean" }
];

const LOCALES = [
    { code: "EN", name: "Baseball Cap", done: true },
    { code: "ES", name: "Gorra de béisbol", done: true },
    { code: "DE", name: "—", done: false }
];

const STAR = (filled: boolean) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
         stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);

export default function EntityTabsDemo({ height = 460 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [tab, setTab] = useState<Tab>("Product");
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        const i = TABS.indexOf(tab);
        // Linger on the custom view — it is the one carrying the argument.
        const dwell = tab === "Custom preview" ? 3800 : 2600;
        timer.current = setTimeout(() => setTab(TABS[(i + 1) % TABS.length]), dwell);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [tab, inView]);

    return (
        <div
            ref={ref}
            className="flex w-full select-none flex-col overflow-hidden rounded-2xl border border-surface-800 bg-[#0c0e12] font-sans text-[13px]"
            style={{ height }}
            aria-label="A product document in FireCMS with a custom React preview mounted as a tab beside the generated form"
        >
            {/* Entity header */}
            <div className="shrink-0 border-b border-surface-800 px-5 pt-3.5">
                <div className="mb-3 flex items-baseline gap-2.5">
                    <span className="font-mono text-[12px] text-surface-300">products/B000P0MDMS</span>
                </div>
                <div className="flex gap-5">
                    {TABS.map(tName => {
                        const active = tName === tab;
                        const custom = tName === "Custom preview";
                        return (
                            <span
                                key={tName}
                                className={
                                    "relative flex items-center gap-1.5 pb-2.5 text-[12px] font-medium uppercase tracking-wide transition-colors duration-300 " +
                                    (active ? "text-white" : "text-surface-600")
                                }
                            >
                                {tName}
                                {custom && (
                                    <span className={"rounded px-1 py-px font-mono text-[9px] tracking-wide transition-colors duration-300 " + (active ? "bg-orange-500/20 text-orange-400" : "bg-surface-800 text-surface-600")}>
                                        yours
                                    </span>
                                )}
                                {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"/>}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden p-5">
                {tab === "Product" && (
                    <div className="space-y-3.5">
                        {FIELDS.map(f => (
                            <div key={f.label} className="grid grid-cols-[88px_72px_minmax(0,1fr)] items-center gap-3">
                                <span className="truncate text-[12px] text-surface-500">{f.label}</span>
                                <span className="truncate rounded bg-surface-900/70 px-2 py-1 text-[11px] text-surface-500 ring-1 ring-inset ring-surface-800">
                                    {f.type}
                                </span>
                                <span className="truncate rounded-lg border border-surface-700 bg-surface-900/60 px-3 py-2 text-surface-100">
                                    {f.value}
                                </span>
                            </div>
                        ))}
                        <p className="pt-1 text-[12px] text-surface-600">Generated from the collection schema.</p>
                    </div>
                )}

                {tab === "Custom preview" && (
                    <div className="flex h-full gap-5">
                        {/* Product imagery, drawn rather than photographed */}
                        <div
                            className="h-full w-[38%] shrink-0 rounded-lg ring-1 ring-inset ring-white/10"
                            style={{ background: "linear-gradient(150deg, hsl(212 18% 42%), hsl(212 22% 20%))" }}
                            aria-hidden="true"
                        />
                        <div className="flex min-w-0 flex-col">
                            <div className="flex items-baseline justify-between gap-3">
                                <span className="truncate text-[19px] font-bold text-white">Baseball Cap</span>
                                <span className="shrink-0 text-[19px] font-bold text-white">€23.99</span>
                            </div>
                            <div className="mt-2 flex gap-0.5 text-primary">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <span key={i}>{STAR(i < 4)}</span>
                                ))}
                            </div>
                            <p className="mt-3 line-clamp-3 text-[12.5px] leading-5 text-surface-400">
                                Made from 100% pigment-dyed cotton denim, with a classic design and
                                an adjustable strap that suits every size.
                            </p>
                            <div className="mt-4">
                                <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-surface-500">Size</span>
                                <div className="flex gap-1.5">
                                    {["XS", "S", "M", "L", "XL"].map(sz => (
                                        <span
                                            key={sz}
                                            className={
                                                "rounded-md px-2 py-1 text-[11.5px] ring-1 ring-inset " +
                                                (sz === "M"
                                                    ? "bg-primary/15 text-primary ring-primary/40"
                                                    : "text-surface-500 ring-surface-800")
                                            }
                                        >
                                            {sz}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <span className="mt-auto inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-[12.5px] font-semibold text-white">
                                Add to cart
                            </span>
                        </div>
                    </div>
                )}

                {tab === "Locales" && (
                    <div className="space-y-2.5">
                        {LOCALES.map(l => (
                            <div key={l.code} className="flex items-center gap-3 rounded-lg border border-surface-800 bg-surface-900/40 px-3.5 py-2.5">
                                <span className="w-8 shrink-0 font-mono text-[11.5px] text-surface-500">{l.code}</span>
                                <span className={"truncate " + (l.done ? "text-surface-200" : "text-surface-600")}>{l.name}</span>
                                <span
                                    className={
                                        "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium " +
                                        (l.done ? "bg-emerald-500/15 text-emerald-400" : "bg-surface-800 text-surface-500")
                                    }
                                >
                                    {l.done ? "translated" : "missing"}
                                </span>
                            </div>
                        ))}
                        <p className="pt-1 text-[12px] text-surface-600">One document, one entry per locale.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
