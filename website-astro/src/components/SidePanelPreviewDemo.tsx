import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import {
    BooleanSwitch, Chip, Icon, PROPERTY_CONFIGS, TextFieldWithLabel, cls,
    defaultBorderMixin, useMaterialIcons
} from "./firecms/ui";

/**
 * Editing a document in the side panel, over the collection it belongs to.
 *
 * Transcribed from packages/firecms_core/src/core: SideDialogs.tsx (the panel
 * itself) and EntityEditView.tsx (an h-14 top bar carrying the tabs, then the
 * form centred in a max-w-4xl column). Field labels follow LabelWithIcon and the
 * inputs follow TextField at size "large" — min-h-[64px], pt-8 pb-2, label at
 * top-1.
 *
 * There is no side-by-side "preview" pane in the product; an earlier version of
 * this demo invented one. The point here is what the panel actually does: the
 * collection keeps its place underneath while you edit.
 *
 * Autoplay only — no pointer events.
 */

const TITLES = [
    "Aviator RB 3025",
    "Aviator Classic Gold",
    "Aviator RB 3025 — 58 mm"
];

/** Rows of the collection sitting behind the panel. */
const BEHIND = [
    { name: "Baseball Cap", cat: { label: "Clothing man", bg: "rgb(102, 102, 102)", fg: "rgb(255, 255, 255)" }, on: true },
    { name: "Conceal invisible shelf", cat: { label: "Home storage", bg: "rgb(204, 204, 204)", fg: "rgb(4, 4, 4)" }, on: true },
    { name: "Aviator RB 3025", cat: { label: "Sunglasses", bg: "rgb(255, 220, 229)", fg: "rgb(76, 12, 28)" }, on: true },
    { name: "Wine decanter", cat: { label: "Serveware", bg: "rgb(139, 70, 255)", fg: "rgb(255, 255, 255)" }, on: false }
];

export default function SidePanelPreviewDemo({ height = 470 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [index, setIndex] = useState(0);
    const [typed, setTyped] = useState(TITLES[0]);
    const [phase, setPhase] = useState<"settled" | "clearing" | "typing">("settled");
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useMaterialIcons();

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;

        if (phase === "settled") {
            timer.current = setTimeout(() => setPhase("clearing"), 3000);
        } else if (phase === "clearing") {
            if (typed.length > 0) {
                timer.current = setTimeout(() => setTyped(t => t.slice(0, Math.max(0, t.length - 6))), 22);
            } else {
                setIndex(i => (i + 1) % TITLES.length);
                setPhase("typing");
            }
        } else {
            const target = TITLES[index];
            if (typed.length < target.length) {
                timer.current = setTimeout(() => setTyped(target.slice(0, typed.length + 2)), 48);
            } else {
                setPhase("settled");
            }
        }
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [phase, typed, index, inView]);

    const showCaret = phase !== "settled";

    return (
        <div ref={ref}
             className="relative flex w-full select-none overflow-hidden rounded-2xl border border-surface-800 bg-surface-950"
             style={{ height }}
             aria-label="A product open in the FireCMS side panel while its collection stays in place underneath">

            {/* The collection, still there underneath */}
            <div className="flex min-w-0 flex-1 flex-col" aria-hidden="true">
                <div className={cls("flex h-12 shrink-0 items-center gap-6 border-b px-4",
                    "text-xs uppercase font-semibold bg-surface-50 dark:bg-surface-900",
                    "text-text-secondary dark:text-text-secondary-dark", defaultBorderMixin)}>
                    <span className="w-[150px]">Name</span>
                    <span className="w-[130px]">Category</span>
                    <span className="w-[80px]">Available</span>
                </div>
                {BEHIND.map(r => (
                    <div key={r.name}
                         className={cls("flex shrink-0 items-center gap-6 border-b px-4 text-sm",
                             "bg-white dark:bg-surface-950 text-text-primary dark:text-text-primary-dark",
                             defaultBorderMixin)}
                         style={{ height: 88 }}>
                        <span className="w-[150px] truncate">{r.name}</span>
                        <span className="w-[130px]">
                            <Chip size={"medium"} colorScheme={{ color: r.cat.bg, text: r.cat.fg }}>{r.cat.label}</Chip>
                        </span>
                        <span className="w-[80px]"><BooleanSwitch on={r.on}/></span>
                    </div>
                ))}
            </div>

            {/* The side panel, over it */}
            <div className={cls(
                "absolute right-0 top-0 h-full w-full max-w-[560px] shadow-[0_0_60px_-10px_rgba(0,0,0,0.8)]",
                "transform flex flex-col bg-white dark:bg-surface-900")}>

                {/* EntityEditView top bar */}
                <div className={cls("h-14 items-center overflow-hidden w-full border-b pl-2 pr-2 flex gap-2",
                    "bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                    <span className="rounded-full inline-flex items-center justify-center w-10 h-10 p-2 text-surface-accent-600 dark:text-surface-accent-300">
                        <Icon icon={"close"}/>
                    </span>
                    <div className={"flex-grow"}/>
                    {/* Tabs, secondary mode */}
                    <div className="inline-flex items-center">
                        <span className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium border-b-2 border-transparent -mb-px text-surface-500">
                            <Icon icon={"code"} size={"small"}/>
                        </span>
                        <span className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium border-b-2 border-b-primary text-primary -mb-px min-w-[120px]">
                            Product
                        </span>
                    </div>
                </div>

                {/* The form */}
                <div className="flex-1 flex flex-row w-full overflow-hidden justify-center">
                    <div className="relative flex flex-col w-full h-fit px-4 py-6 gap-4 max-w-4xl">
                        <TextFieldWithLabel
                            label={"Name"}
                            icon={{ icon: PROPERTY_CONFIGS.text_field.icon, color: PROPERTY_CONFIGS.text_field.color }}
                            value={typed || " "}
                            caret={showCaret}/>
                        <TextFieldWithLabel
                            label={"Brand"}
                            icon={{ icon: PROPERTY_CONFIGS.text_field.icon, color: PROPERTY_CONFIGS.text_field.color }}
                            value={"Ray-Ban"}/>
                        <TextFieldWithLabel
                            label={"Price"}
                            icon={{ icon: PROPERTY_CONFIGS.number_input.icon, color: PROPERTY_CONFIGS.number_input.color }}
                            value={"115"}/>
                    </div>
                </div>
            </div>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .caret { animation: sp-caret 1s steps(1, end) infinite; }
                }
                @keyframes sp-caret { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
            `}</style>
        </div>
    );
}
