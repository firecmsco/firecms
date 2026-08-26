import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import {
    Chip, defaultBorderMixin, Icon, IconButton, Typography, cls, useMaterialIcons
} from "./firecms/ui";

/**
 * Entity revisions — the FireCMS PRO history view.
 *
 * Transcribed from packages/entity_history/src/components/EntityHistoryView.tsx
 * and EntityHistoryEntry.tsx: a vertical list of revisions, each one a timestamp
 * and user chip above a bordered card, and inside the card one row per changed
 * field — the key right-aligned in a caption, the previous value struck through
 * above the new one. There is no red/green diff in the product; do not add one.
 *
 * Autoplay only — no pointer events.
 */

type Change = { key: string; from?: string | number | boolean; to: string | number | boolean };

type Revision = {
    id: string;
    when: string;
    user: { name: string; photoURL: string };
    changes: Change[];
};

/* The demo project's own users and product. */
const REVISIONS: Revision[] = [
    {
        id: "r4",
        when: "26/08/2026, 14:12:03",
        user: { name: "Marta Ruiz", photoURL: "https://i.pravatar.cc/48?img=47" },
        changes: [
            { key: "price", from: 129, to: 115 },
            { key: "available", from: false, to: true }
        ]
    },
    {
        id: "r3",
        when: "25/08/2026, 09:41:22",
        user: { name: "Sam Keller", photoURL: "https://i.pravatar.cc/48?img=12" },
        changes: [
            { key: "description", from: "Unisex sunglasses, gold frame.", to: "Unisex Sunglasses, Gold, 58 mm. Iconic, timeless style." }
        ]
    },
    {
        id: "r2",
        when: "12/08/2026, 17:03:47",
        user: { name: "Francesco Gatti", photoURL: "https://i.pravatar.cc/48?img=68" },
        changes: [
            { key: "category", from: "Accessories", to: "Sunglasses" },
            { key: "brand", to: "Ray-Ban" }
        ]
    }
];

/** UserChip — packages/entity_history/src/components/UserChip.tsx */
function UserChip({ user }: { user: Revision["user"] }) {
    return (
        <Chip size={"small"} className={"flex items-center"}>
            <img className={"rounded-full w-6 h-6 mr-2"} src={user.photoURL} alt={user.name} loading="lazy"/>
            <span>{user.name}</span>
        </Chip>
    );
}

/** PreviousValueView — a struck-through caption, for string/number/boolean. */
function PreviousValue({ value }: { value: string | number | boolean }) {
    return (
        <Typography variant={"caption"} color={"secondary"} className="line-through">
            {typeof value === "boolean" ? (value ? "true" : "false") : value}
        </Typography>
    );
}

/** PropertyPreview size="small" renders a plain value as <span class="text-sm">. */
function ValuePreview({ value }: { value: string | number | boolean }) {
    if (typeof value === "boolean") {
        return <span className={"text-sm"}>{value ? "true" : "false"}</span>;
    }
    return <span className={"text-sm"}>{value}</span>;
}

function EntityHistoryEntry({ revision }: { revision: Revision }) {
    return (
        <div className={"w-full flex flex-col gap-2 mt-4"}>
            <div className={"ml-4 flex items-center gap-4"}>
                <Typography variant={"body2"} color={"secondary"}>{revision.when}</Typography>
                <UserChip user={revision.user}/>
            </div>
            <div className={cls(
                "bg-white dark:bg-surface-900",
                "min-h-[44px]", "w-full", "items-center", "px-2 py-1",
                "flex border rounded-lg",
                defaultBorderMixin)}>

                <span className={"m-2 grow-0 self-start"}>
                    <IconButton><Icon icon={"history"}/></IconButton>
                </span>

                <span className={"my-2 grow-0 shrink-0 self-start"}>
                    <IconButton><Icon icon={"keyboard_tab"}/></IconButton>
                </span>

                <div className={"flex flex-col grow w-full m-1 shrink min-w-0"}>
                    {revision.changes.map(change => (
                        <div key={change.key} className="flex w-full my-1 items-center">
                            <Typography
                                variant={"caption"}
                                color={"secondary"}
                                className="min-w-[140px] md:min-w-[200px] w-1/5 pr-8 overflow-hidden text-ellipsis text-right">
                                {change.key}
                            </Typography>
                            <div className="w-4/5">
                                {change.from !== undefined && change.from !== change.to &&
                                    <PreviousValue value={change.from}/>}
                                <ValuePreview value={change.to}/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function EntityHistoryDemo({ height = 480 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [shown, setShown] = useState(1);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useMaterialIcons();

    // Revisions arrive newest-first as the listener pages in.
    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        const done = shown >= REVISIONS.length;
        timer.current = setTimeout(() => setShown(s => (s >= REVISIONS.length ? 1 : s + 1)), done ? 3200 : 1500);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [shown, inView]);

    return (
        <div ref={ref}
             className="w-full select-none overflow-hidden rounded-2xl border border-surface-800 bg-surface-950"
             style={{ height }}
             aria-label="The FireCMS entity history view: revisions of a Firestore document with the fields each one changed">
            <div className={"relative h-full overflow-hidden w-full flex flex-col gap-4 p-8 bg-white dark:bg-surface-950"}>
                <div className={"flex flex-col gap-2 max-w-6xl mx-auto w-full"}>
                    <Typography variant={"h5"} className={"ml-4"}>History</Typography>
                    {REVISIONS.slice(0, shown).map(rev => (
                        <div key={rev.id} className="flex flex-cols gap-2 w-full hist-in">
                            <EntityHistoryEntry revision={rev}/>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .hist-in { animation: eh-in 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                }
                @keyframes eh-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
            `}</style>
        </div>
    );
}
