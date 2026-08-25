import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * A collection table showing the three Firestore types that usually break
 * generated admin tools: references resolved to real documents, Storage files
 * previewed in the row, and arrays of both. A custom row action opens on a
 * rotating row to show that the menu is extensible.
 *
 * Hand-built rather than a screenshot so it stays sharp, follows the theme and
 * never drifts from the product. Autoplay only — no pointer events.
 */

type Row = {
    id: string;
    name: string;
    email: string;
    /** Referenced product documents, resolved to their titles. */
    liked: { title: string; hue: number }[];
    /** Hue for the Storage image preview. */
    avatarHue: number;
};

const ROWS: Row[] = [
    {
        id: "027yADk8gFP48WR",
        name: "Keira",
        email: "keira.white@example.com",
        liked: [{ title: "Igor sofá", hue: 24 }, { title: "Textiles Map", hue: 128 }],
        avatarHue: 12
    },
    {
        id: "0a1LmQ7rTb92XcE",
        name: "Neil",
        email: "neil.ruiz@example.com",
        liked: [{ title: "Wine decanter", hue: 268 }],
        avatarHue: 208
    },
    {
        id: "0hTr4wV1sYd66Kb",
        name: "Olivia",
        email: "olivia.palo@example.com",
        liked: [{ title: "Snap camera", hue: 196 }, { title: "Aviator RB", hue: 40 }],
        avatarHue: 330
    },
    {
        id: "0pQ9zXn2eLg07Ju",
        name: "Marcus",
        email: "marcus.oyelaran@example.com",
        liked: [{ title: "Wobble chess set", hue: 88 }],
        avatarHue: 268
    }
];

const COLUMNS = ["ID", "First name", "Liked products", "Picture", "Email"];

function Thumb({ hue, rounded = "rounded" }: { hue: number; rounded?: string }) {
    return (
        <span
            className={`inline-block h-7 w-7 shrink-0 ${rounded} ring-1 ring-inset ring-white/10`}
            style={{
                background: `linear-gradient(140deg, hsl(${hue} 55% 46%), hsl(${(hue + 38) % 360} 48% 28%))`
            }}
            aria-hidden="true"
        />
    );
}

const ARROW = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
);

const MENU_ITEMS = [
    { label: "Copy", custom: false },
    { label: "Delete", custom: false },
    { label: "Send email voucher code", custom: true }
];

export default function ReferenceTableDemo({ height = 460 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [openRow, setOpenRow] = useState<number | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Rotate the open row-action menu so the custom entry is always on its way
    // in or out, rather than sitting still.
    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;

        // Only the upper rows open a menu: the panel is anchored to its row and
        // the container clips, so the lower rows have nowhere to put it.
        const MENU_ROWS = 2;
        const next = openRow === null ? 0 : openRow + 1 >= MENU_ROWS ? null : openRow + 1;
        timer.current = setTimeout(() => setOpenRow(next), openRow === null ? 1400 : 2100);

        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [openRow, inView]);

    return (
        <div
            ref={ref}
            className="flex w-full select-none flex-col overflow-hidden rounded-2xl border border-surface-800 bg-[#0c0e12] font-sans text-[13px]"
            style={{ height }}
            aria-label="A FireCMS collection table: referenced products resolved to their titles, Storage image previews, and a custom row action"
        >
            {/* Collection header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-surface-800 px-5 py-3.5">
                <div className="flex items-baseline gap-2.5">
                    <span className="text-[15px] font-semibold text-white">Users</span>
                    <span className="text-[12px] text-surface-500">392 entities</span>
                </div>
                <span className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-white">
                    Add user
                </span>
            </div>

            {/* Column headers */}
            <div className="grid shrink-0 grid-cols-[92px_minmax(0,1fr)_78px_minmax(0,1fr)] gap-3 border-b border-surface-800 bg-surface-900/40 px-5 py-2 xl:grid-cols-[110px_92px_minmax(0,1fr)_78px_minmax(0,1fr)]">
                {COLUMNS.map((c, i) => (
                    <span
                        key={c}
                        className={"truncate text-[10.5px] font-semibold uppercase tracking-[0.09em] text-surface-500 " + (i === 0 ? "hidden xl:inline" : "")}
                    >
                        {c}
                    </span>
                ))}
            </div>

            {/* Rows */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
                {ROWS.map((row, i) => (
                    <div
                        key={row.id}
                        className={
                            "relative grid grid-cols-[92px_minmax(0,1fr)_78px_minmax(0,1fr)] items-center gap-3 border-b border-surface-800/70 px-5 py-3 transition-colors duration-300 xl:grid-cols-[110px_92px_minmax(0,1fr)_78px_minmax(0,1fr)] " +
                            (openRow === i ? "bg-surface-900/60" : "")
                        }
                    >
                        <span className="hidden truncate font-mono text-[11px] text-surface-600 xl:inline">{row.id}</span>
                        <span className="truncate text-surface-200">{row.name}</span>

                        {/* Array of references, each resolved to its document */}
                        <div className="flex min-w-0 flex-wrap gap-1.5">
                            {row.liked.map(p => (
                                <span
                                    key={p.title}
                                    className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-surface-900/80 py-1 pl-1 pr-2 ring-1 ring-inset ring-surface-700/70"
                                >
                                    <Thumb hue={p.hue}/>
                                    <span className="truncate text-[12px] text-surface-300">{p.title}</span>
                                    <span className="text-surface-600">{ARROW}</span>
                                </span>
                            ))}
                        </div>

                        {/* Storage file, previewed in the row */}
                        <Thumb hue={row.avatarHue} rounded="rounded-md"/>

                        <span className="truncate text-[12px] text-surface-400">{row.email}</span>

                        {openRow === i && (
                            <div className="absolute left-6 top-[calc(100%-8px)] z-10 w-[236px] overflow-hidden rounded-lg border border-surface-700 bg-[#151a21] shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)]">
                                {MENU_ITEMS.map(item => (
                                    <div
                                        key={item.label}
                                        className={
                                            "flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] " +
                                            (item.custom
                                                ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/40"
                                                : "text-surface-300")
                                        }
                                    >
                                        {item.label}
                                        {item.custom && (
                                            <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wide text-primary/80">
                                                custom
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

            </div>
        </div>
    );
}
