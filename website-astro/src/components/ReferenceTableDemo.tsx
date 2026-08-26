import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import {
    Chip, Icon, cls, defaultBorderMixin, useMaterialIcons
} from "./firecms/ui";

/**
 * References, Storage files and arrays of both, in a collection table.
 *
 * Table geometry follows the running app: fixed pixel column widths, a sticky id
 * column with the row actions, header cells from VirtualTableHeader.tsx. A
 * reference renders as EntityPreviewContainer — packages/firecms_core/src/
 * components/EntityPreview.tsx — which is `bg-white dark:bg-surface-900
 * min-h-[44px] items-center px-2 py-1 flex border rounded-lg`, the same shape
 * the history view uses.
 *
 * Autoplay only — no pointer events.
 */

const STORAGE = "https://firebasestorage.googleapis.com/v0/b/firecms-demo-27150.appspot.com/o/dadaki%2F";
const img = (file: string, token: string) => `${STORAGE}${file}?alt=media&token=${token}`;

type Ref = { name: string; image?: string };
type Row = {
    id: string;
    name: string;
    category: { label: string; bg: string; fg: string };
    /** A reference property — one related document. */
    supplier: Ref;
    /** An array of references. */
    related: Ref[];
    /** An array of Storage files. */
    gallery: string[];
};

const ROWS: Row[] = [
    {
        id: "B000ZHY0JK",
        name: "Aviator RB 3025",
        category: { label: "Sunglasses", bg: "rgb(255, 220, 229)", fg: "rgb(76, 12, 28)" },
        supplier: { name: "Ray-Ban" },
        related: [{ name: "Wayfarer RB 2140" }, { name: "Clubmaster RB 3016" }],
        gallery: [
            img("B000ZHY0JK-2047853797.jpg", "9e609a03-5866-4bd3-919b-7f40e599f7e0"),
            img("B000P0MDMS-576916726.jpg", "e7091ba7-39fd-43e5-ac3b-230e03f91532")
        ]
    },
    {
        id: "B000UO4KXY",
        name: "Conceal invisible shelf",
        category: { label: "Home storage", bg: "rgb(204, 204, 204)", fg: "rgb(4, 4, 4)" },
        supplier: { name: "Umbra" },
        related: [{ name: "Wobble Chess Set" }],
        gallery: [img("B000UO4KXY-825906283.jpg", "ab3371da-0801-466c-b980-bd52a91d40d0")]
    },
    {
        id: "B0017TNJWY",
        name: "Wine decanter",
        category: { label: "Serveware", bg: "rgb(139, 70, 255)", fg: "rgb(255, 255, 255)" },
        supplier: { name: "Sagaform" },
        related: [],
        gallery: [img("B0017TNJWY-528977189.jpg", "690f494a-6a01-4bed-a9da-c9d61ddac4d6")]
    }
];

const COLS = [
    { key: "name",     label: "Name",     w: 190, icon: "short_text", justify: "left" },
    { key: "category", label: "Category", w: 150, icon: "list",       justify: "left" },
    { key: "supplier", label: "Supplier", w: 210, icon: "link",       justify: "left" },
    { key: "related",  label: "Related",  w: 250, icon: "add_link",   justify: "left" },
    { key: "gallery",  label: "Gallery",  w: 190, icon: "drive_folder_upload", justify: "left" }
] as const;

/** EntityPreviewContainer — packages/firecms_core/src/components/EntityPreview.tsx */
function EntityPreview({ entity, size = "small" }: { entity: Ref; size?: "small" | "medium" }) {
    return (
        <div className={cls(
            "bg-white dark:bg-surface-900",
            "min-h-[44px]", "w-full", "items-center",
            size === "small" ? "p-1" : "px-2 py-1",
            "flex border rounded-lg gap-2",
            defaultBorderMixin)}>
            <span className="rounded-full inline-flex items-center justify-center w-7 h-7 min-w-7 min-h-7 p-2 text-surface-accent-600 dark:text-surface-accent-300 shrink-0">
                <Icon icon={"keyboard_tab"} size={"smallest"}/>
            </span>
            <span className="truncate text-sm">{entity.name}</span>
        </div>
    );
}

export default function ReferenceTableDemo({ height = 560 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [pulse, setPulse] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useMaterialIcons();

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        timer.current = setTimeout(() => setPulse(p => (p + 1) % ROWS.length), 2400);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [pulse, inView]);

    return (
        <div ref={ref}
             className="flex w-full select-none overflow-hidden rounded-2xl border border-surface-800 bg-surface-950"
             style={{ height }}
             aria-label="A Firestore collection table with a reference column, an array of references and an array of Storage files">
            <div className="flex min-w-0 flex-1 flex-col">

                <div className="flex h-12 w-fit min-w-full shrink-0 flex-row border-b border-surface-800/40">
                    <div className="flex-shrink-0 bg-surface-50 dark:bg-surface-900" style={{ minWidth: 160, maxWidth: 160, width: 160 }}/>
                    {COLS.map(c => (
                        <div key={c.key}
                             className={cls(
                                 "flex py-0 px-3 h-full text-xs uppercase font-semibold relative select-none items-center",
                                 "bg-surface-50 dark:bg-surface-900",
                                 "text-text-secondary dark:text-text-secondary-dark")}
                             style={{ minWidth: c.w, maxWidth: c.w, width: c.w }}>
                            <div className="overflow-hidden flex-grow">
                                <div className="flex items-center flex-row">
                                    <Icon icon={c.icon} size={"small"} className="text-surface-accent-500"/>
                                    <div className="truncate w-full mx-1 overflow-hidden">{c.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {ROWS.map((row, i) => (
                    <div key={row.id}
                         className={cls("flex min-w-full w-fit shrink-0 text-sm border-b border-surface-800/40 transition-colors duration-500",
                             i === pulse && "bg-surface-900/40")}
                         style={{ height: 140 }}>

                        <div className="flex-shrink-0 bg-surface-950" style={{ minWidth: 160, maxWidth: 160, width: 160 }}>
                            <div className="flex h-full flex-col items-center justify-center bg-surface-900/90">
                                <div className="flex w-full justify-center text-surface-accent-300">
                                    <Icon icon={"edit"} className="mx-1"/>
                                    <Icon icon={"more_vert"} className="mx-1"/>
                                    <span className="mx-1 mt-0.5 h-5 w-5 rounded border-2 border-surface-accent-500"/>
                                </div>
                                <div className="mt-1 w-[138px] truncate px-2 text-center font-mono text-xs text-text-secondary-dark">
                                    {row.id}
                                </div>
                            </div>
                        </div>

                        {COLS.map(c => {
                            const style = { minWidth: c.w, maxWidth: c.w, width: c.w } as React.CSSProperties;
                            const cell = (children: React.ReactNode) => (
                                <div key={c.key} className="flex-shrink-0" style={style}>
                                    <div className="flex relative h-full rounded-md border-4 border-transparent overflow-hidden p-2 items-center">
                                        <div className="flex flex-col max-h-full w-full gap-1">{children}</div>
                                    </div>
                                </div>
                            );
                            if (c.key === "name") return cell(<span className="text-text-primary-dark">{row.name}</span>);
                            if (c.key === "category") return cell(
                                <Chip size={"medium"} colorScheme={{ color: row.category.bg, text: row.category.fg }}>
                                    {row.category.label}
                                </Chip>);
                            if (c.key === "supplier") return cell(<EntityPreview entity={row.supplier}/>);
                            if (c.key === "related") return cell(
                                row.related.length
                                    ? row.related.map(r => <EntityPreview key={r.name} entity={r}/>)
                                    : <span className="text-text-disabled-dark text-sm">—</span>);
                            return cell(
                                <div className="flex gap-1.5">
                                    {row.gallery.map((src, gi) => (
                                        <img key={gi} src={src} alt="" loading="lazy"
                                             className="rounded-md bg-white"
                                             style={{ width: 72, height: 72, objectFit: "contain" }}/>
                                    ))}
                                </div>);
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
