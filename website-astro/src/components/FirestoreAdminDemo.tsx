import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import { Icon, Typography, cls, defaultBorderMixin, useMaterialIcons } from "./firecms/ui";

/**
 * The Firestore explorer — FireCMS's raw data view.
 *
 * Transcribed from packages/firebase_admin/src: FirestoreExplorer.tsx (the
 * sidebar over `bg-surface-50 dark:bg-surface-900` with a "Collections" label,
 * beside the document panes on `bg-white dark:bg-surface-950`), CollectionTree
 * .tsx (tree rows, amber folder icons, primary when selected) and
 * DocumentTable.tsx (mono ids, slate values, italic nulls).
 *
 * An earlier version of this was painted in the Firebase console's own palette —
 * #8ab4f8, #34a853, #1f2023 — which made a FireCMS feature look like Google's
 * console on a page arguing against it. Everything here is now the app's tokens.
 *
 * Autoplay only — no pointer events.
 */

const COLLECTIONS = ["blog", "books", "crypto", "pages", "products", "showcase", "tags", "tickets", "users"];

type Doc = { id: string; fields: { key: string; value: string; type: "string" | "number" | "boolean" | "null" | "ref" }[] };

const DOCS: Doc[] = [
    {
        id: "B000ZHY0JK",
        fields: [
            { key: "name", value: '"Aviator RB 3025"', type: "string" },
            { key: "brand", value: '"Ray-Ban"', type: "string" },
            { key: "price", value: "115", type: "number" },
            { key: "available", value: "true", type: "boolean" },
            { key: "category", value: "/categories/sunglasses", type: "ref" },
            { key: "discount", value: "null", type: "null" }
        ]
    },
    {
        id: "B000P0MDMS",
        fields: [
            { key: "name", value: '"Baseball Cap"', type: "string" },
            { key: "brand", value: '"Authentic Pigment"', type: "string" },
            { key: "price", value: "23.99", type: "number" },
            { key: "available", value: "true", type: "boolean" },
            { key: "category", value: "/categories/clothing", type: "ref" },
            { key: "discount", value: "null", type: "null" }
        ]
    },
    {
        id: "B0017TNJWY",
        fields: [
            { key: "name", value: '"Wine decanter"', type: "string" },
            { key: "brand", value: '"Sagaform"', type: "string" },
            { key: "price", value: "null", type: "null" },
            { key: "available", value: "false", type: "boolean" },
            { key: "category", value: "/categories/serveware", type: "ref" },
            { key: "discount", value: "null", type: "null" }
        ]
    }
];

/** DocumentTable.tsx value colours. */
function FieldValue({ value, type }: { value: string; type: Doc["fields"][number]["type"] }) {
    if (type === "null") {
        return <span className="text-surface-400 dark:text-surface-500 italic font-mono text-xs">null</span>;
    }
    if (type === "ref") {
        return <span className="text-primary font-mono text-xs truncate">{value}</span>;
    }
    return <span className="text-slate-500 dark:text-slate-400 font-mono text-xs truncate">{value}</span>;
}

export default function FirestoreAdminDemo({ height = 700 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [docIndex, setDocIndex] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useMaterialIcons();

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        timer.current = setTimeout(() => setDocIndex(i => (i + 1) % DOCS.length), 2800);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [docIndex, inView]);

    const doc = DOCS[docIndex];

    return (
        <div ref={ref}
             className={cls("flex w-full select-none overflow-hidden rounded-2xl border border-surface-800",
                 "bg-white dark:bg-surface-950")}
             style={{ height }}
             aria-label="The FireCMS Firestore explorer: the collection tree, the documents in a collection and the raw fields of the selected document">

            {/* Sidebar — FirestoreExplorer.tsx */}
            <div className={cls("flex w-[260px] min-w-[260px] shrink-0 flex-col h-full overflow-hidden",
                "bg-surface-50 dark:bg-surface-900", "border-r", defaultBorderMixin)}>
                <div className="px-4 pt-3 pb-2">
                    <Typography variant={"label"} className={"text-surface-500 dark:text-surface-400 uppercase text-xs tracking-wider"}>
                        Collections
                    </Typography>
                </div>
                <div className="flex-grow overflow-hidden px-2 pb-4">
                    {COLLECTIONS.map(c => {
                        const selected = c === "products";
                        return (
                            <div key={c}
                                 className={cls(
                                     "group flex items-center gap-2 py-1.5 px-3 rounded-md transition-colors",
                                     selected && "bg-primary/10")}>
                                <Icon icon={"folder"} size={"smallest"}
                                      className={cls("flex-shrink-0", selected ? "text-primary" : "text-amber-500 dark:text-amber-400")}/>
                                <span className={cls("flex-grow truncate text-sm typography-body2",
                                    selected ? "text-primary font-medium" : "text-text-primary dark:text-text-primary-dark")}>
                                    {c}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Documents */}
            <div className={cls("flex w-[260px] min-w-[260px] shrink-0 flex-col h-full overflow-hidden border-r", defaultBorderMixin)}>
                <div className={cls("px-4 pt-3 pb-2 border-b", defaultBorderMixin)}>
                    <Typography variant={"label"} className={"text-surface-500 dark:text-surface-400 uppercase text-xs tracking-wider"}>
                        Documents
                    </Typography>
                </div>
                <div className="flex-grow overflow-hidden p-2">
                    {DOCS.map((d, i) => (
                        <div key={d.id}
                             className={cls("group flex items-center gap-2 py-1.5 px-3 rounded-md transition-colors",
                                 i === docIndex && "bg-primary/10")}>
                            <Icon icon={"article"} size={"smallest"}
                                  className={cls("flex-shrink-0", i === docIndex ? "text-primary" : "text-surface-400 dark:text-surface-500")}/>
                            <span className={cls("font-mono text-xs truncate flex-grow",
                                i === docIndex ? "text-primary font-medium" : "text-text-secondary dark:text-text-secondary-dark")}>
                                {d.id}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Document fields — DocumentPanel.tsx */}
            <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
                <div className={cls("flex items-center gap-2 px-4 py-3 border-b", defaultBorderMixin)}>
                    <div className="flex-grow min-w-0">
                        <Typography variant={"subtitle2"} className={"truncate font-mono block"}>{doc.id}</Typography>
                        <Typography variant={"caption"} color={"secondary"} className={"truncate block"}>
                            products/{doc.id}
                        </Typography>
                    </div>
                    <span className="rounded-full inline-flex items-center justify-center w-8 h-8 p-2 text-surface-accent-600 dark:text-surface-accent-300">
                        <Icon icon={"delete"} size={"small"}/>
                    </span>
                </div>

                <div className={cls("flex items-center gap-4 px-4 border-b", defaultBorderMixin)}>
                    {["Fields", "Subcollections", "JSON"].map((t, i) => (
                        <span key={t}
                              className={cls("inline-flex items-center whitespace-nowrap py-2 text-sm font-medium border-b-2 -mb-px",
                                  i === 0 ? "border-b-primary text-primary" : "border-transparent text-text-secondary dark:text-text-secondary-dark")}>
                            {t}
                        </span>
                    ))}
                </div>

                <div key={doc.id} className="doc-in flex-grow overflow-hidden p-3">
                    {doc.fields.map(f => (
                        <div key={f.key}
                             className={cls("flex items-baseline gap-3 py-2 px-2 rounded-md border-b last:border-b-0", defaultBorderMixin)}>
                            <span className="w-[110px] shrink-0 font-mono text-xs text-text-primary dark:text-white truncate">
                                {f.key}
                            </span>
                            <FieldValue value={f.value} type={f.type}/>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .doc-in { animation: fa-in 280ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                }
                @keyframes fa-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
            `}</style>
        </div>
    );
}
