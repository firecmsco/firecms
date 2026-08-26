import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import {
    BooleanSwitch, Button, Chip, Icon, SelectDisplay, TextFieldDisplay, Typography,
    cls, defaultBorderMixin, fieldBackgroundMixin, useMaterialIcons
} from "./firecms/ui";

/**
 * Filtering a Firestore collection — the FireCMS filters dialog.
 *
 * Transcribed from packages/firecms_core/src/components/EntityCollectionView:
 * FiltersDialog.tsx (a 3xl dialog with a two-column table of property name and
 * filter field) and EntityCollectionViewStartActions.tsx (the toolbar "Filters"
 * button, which carries a primary Badge and an active count). The filter
 * operators are the product's own set from StringNumberFilterField.
 *
 * Table geometry — column widths, 140px rows, the sticky id column — matches
 * ProductsCollectionDemo, which was reconstructed from the running app's DOM.
 *
 * Autoplay only — no pointer events.
 */

const STORAGE = "https://firebasestorage.googleapis.com/v0/b/firecms-demo-27150.appspot.com/o/dadaki%2F";
const img = (file: string, token: string) => `${STORAGE}${file}?alt=media&token=${token}`;

type ChipVal = { label: string; bg: string; fg: string };
type Row = { id: string; name: string; image: string; category: ChipVal; available: boolean; price: number | null };

const ROWS: Row[] = [
    { id: "B000P0MDMS", name: "Baseball Cap", image: img("B000P0MDMS-576916726.jpg", "e7091ba7-39fd-43e5-ac3b-230e03f91532"),
      category: { label: "Clothing man", bg: "rgb(102, 102, 102)", fg: "rgb(255, 255, 255)" }, available: true, price: 23.99 },
    { id: "B000UO4KXY", name: "Conceal invisible shelf", image: img("B000UO4KXY-825906283.jpg", "ab3371da-0801-466c-b980-bd52a91d40d0"),
      category: { label: "Home storage", bg: "rgb(204, 204, 204)", fg: "rgb(4, 4, 4)" }, available: true, price: 225 },
    { id: "B000ZHY0JK", name: "Aviator RB 3025", image: img("B000ZHY0JK-2047853797.jpg", "9e609a03-5866-4bd3-919b-7f40e599f7e0"),
      category: { label: "Sunglasses", bg: "rgb(255, 220, 229)", fg: "rgb(76, 12, 28)" }, available: true, price: 115 },
    { id: "B0017TNJWY", name: "Wine decanter", image: img("B0017TNJWY-528977189.jpg", "690f494a-6a01-4bed-a9da-c9d61ddac4d6"),
      category: { label: "Serveware", bg: "rgb(139, 70, 255)", fg: "rgb(255, 255, 255)" }, available: false, price: null }
];

const COLS = [
    { key: "name", label: "Name", w: 185, icon: "short_text", justify: "left" },
    { key: "image", label: "Image", w: 160, icon: "upload_file", justify: "left" },
    { key: "category", label: "Category", w: 145, icon: "list", justify: "left" },
    { key: "available", label: "Available", w: 100, icon: "flag", justify: "center" },
    { key: "price", label: "Price", w: 220, icon: "numbers", justify: "right" }
] as const;

/**
 * Beats of the sequence.
 *
 * `local*` is what the dialog is holding; `applied*` is what the table is
 * querying with. FiltersDialog keeps its edits in local state and only calls
 * `setFilterValues` on Apply, so the rows must not move while it is open.
 */
type Beat = {
    dialog: boolean;
    localAvailable: boolean;
    localPrice: boolean;
    appliedAvailable: boolean;
    appliedPrice: boolean;
    caption: string;
};

const BEATS: Beat[] = [
    { dialog: false, localAvailable: false, localPrice: false, appliedAvailable: false, appliedPrice: false,
      caption: "The whole collection." },
    { dialog: true,  localAvailable: false, localPrice: false, appliedAvailable: false, appliedPrice: false,
      caption: "Filters opens on the collection's own properties." },
    { dialog: true,  localAvailable: true,  localPrice: false, appliedAvailable: false, appliedPrice: false,
      caption: "A boolean filter is a switch." },
    { dialog: true,  localAvailable: true,  localPrice: true,  appliedAvailable: false, appliedPrice: false,
      caption: "Numbers get an operator and a value." },
    { dialog: false, localAvailable: true,  localPrice: true,  appliedAvailable: true,  appliedPrice: true,
      caption: "Applied — available products over €100, sorted by price." },
    { dialog: false, localAvailable: true,  localPrice: true,  appliedAvailable: true,  appliedPrice: true,
      caption: "Applied — available products over €100, sorted by price." }
];

function HeaderCell({ col, sorted }: { col: typeof COLS[number]; sorted?: boolean }) {
    /* VirtualTableHeader.tsx */
    return (
        <div
            className={cls(
                "flex py-0 px-3 h-full text-xs uppercase font-semibold relative select-none items-center",
                "bg-surface-50 dark:bg-surface-900",
                "text-text-secondary dark:text-text-secondary-dark")}
            style={{ minWidth: col.w, maxWidth: col.w, width: col.w }}>
            <div className="overflow-hidden flex-grow">
                <div className={cls("flex items-center flex-row",
                    col.justify === "center" ? "justify-center" : col.justify === "right" ? "justify-end" : "")}>
                    <Icon icon={col.icon} size={"small"} className="text-surface-accent-500"/>
                    <div className="truncate w-full mx-1 overflow-hidden">{col.label}</div>
                </div>
            </div>
            {sorted && (
                <span className="relative inline-block w-fit">
                    <span className="rounded-full inline-flex items-center justify-center w-8 h-8 min-w-8 min-h-8 p-2 bg-white dark:bg-surface-950">
                        <Icon icon={"arrow_upward"} size={"small"}/>
                    </span>
                    <span className="absolute top-0.5 right-0.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary w-2 h-2"/>
                </span>
            )}
        </div>
    );
}

export default function QueryFilterDemo({ height = 760 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [step, setStep] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useMaterialIcons();

    const beat = BEATS[step % BEATS.length];

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        timer.current = setTimeout(() => setStep(s => s + 1), 2600);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [step, inView]);

    const activeFilterCount = (beat.appliedAvailable ? 1 : 0) + (beat.appliedPrice ? 1 : 0);
    const localFilterCount = (beat.localAvailable ? 1 : 0) + (beat.localPrice ? 1 : 0);
    const visible = ROWS.filter(r =>
        (!beat.appliedAvailable || r.available) &&
        (!beat.appliedPrice || (r.price ?? 0) > 100));

    return (
        <div ref={ref} className="w-full select-none">
            <div className="relative flex w-full overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 text-white"
                 style={{ height }}
                 aria-label="Filtering a Firestore collection in FireCMS using the filters dialog">

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
                        {[["article", false], ["shopping_cart", true], ["person", false], ["confirmation_number", false]].map(([icon, active], i) => (
                            <div key={i} className={cls("mx-2 my-1 flex h-[30px] items-center rounded-lg", active && "bg-primary/10")}>
                                <div className={cls("flex h-[30px] w-[44px] shrink-0 items-center justify-center",
                                    active ? "text-primary" : "text-text-secondary-dark")}>
                                    <Icon icon={icon as string} size={18}/>
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
                            <span className="rounded bg-surface-700 px-1.5 text-xs tabular-nums text-surface-accent-400">256</span>
                        </div>
                        <div className="flex-grow"/>
                        <Icon icon={"dark_mode"} className="text-surface-accent-300"/>
                        <span className="ml-1 h-8 w-8 rounded-full bg-surface-accent-800"/>
                    </div>

                    <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-surface-700/40">
                        {/* Toolbar — EntityCollectionViewStartActions.tsx */}
                        <div className="flex min-h-[52px] shrink-0 flex-row items-center justify-between border-b border-surface-700/40 bg-surface-900 px-4">
                            <div className="flex items-center gap-1">
                                <span className="relative inline-block w-fit">
                                    <Button variant={"textNeutral"} size={"small"}
                                            className={cls("pl-3", activeFilterCount > 0 && "text-primary")}>
                                        <Icon icon={"filter_list"} size={"small"}/>
                                        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                                    </Button>
                                    <span className={cls(
                                        "absolute top-0.5 right-0.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-all duration-200 ease-out",
                                        activeFilterCount > 0 ? "w-2 h-2" : "w-0 h-0")}/>
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Icon icon={"download"} className="mx-1 text-surface-accent-300"/>
                                <Button variant={"filledPrimary"} size={"medium"}>
                                    <Icon icon={"add"} size={"small"}/>
                                    Add Product
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="min-h-0 flex-1 overflow-hidden bg-surface-950">
                            <div className="flex h-12 w-fit min-w-full flex-row border-b border-surface-800/40">
                                <div className="flex-shrink-0 bg-surface-900" style={{ minWidth: 160, maxWidth: 160, width: 160 }}/>
                                {COLS.map(c => <HeaderCell key={c.key} col={c} sorted={c.key === "price" && activeFilterCount === 2}/>)}
                            </div>

                            {visible.map(row => (
                                <div key={row.id} className="row flex min-w-full w-fit text-sm border-b border-surface-800/40" style={{ height: 140 }}>
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
                                        const inner = (children: React.ReactNode, pad = "p-2") => (
                                            <div key={c.key} className="flex-shrink-0" style={style}>
                                                <div className={cls("flex relative h-full rounded-md border-4 border-transparent overflow-hidden", pad)}
                                                     style={{ justifyContent: c.justify === "center" ? "center" : c.justify === "right" ? "flex-end" : "flex-start", alignItems: "center" }}>
                                                    <div className="flex flex-col max-h-full w-full" style={{ alignItems: c.justify === "center" ? "center" : c.justify === "right" ? "flex-end" : "flex-start" }}>
                                                        {children}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                        if (c.key === "name") return inner(<span>{row.name}</span>);
                                        if (c.key === "image") return inner(
                                            <div className="relative p-2">
                                                <img className="rounded-md" src={row.image} alt="" loading="lazy"
                                                     style={{ width: 100, height: 100, objectFit: "contain" }}/>
                                            </div>, "p-0");
                                        if (c.key === "category") return inner(
                                            <Chip size={"medium"} colorScheme={{ color: row.category.bg, text: row.category.fg }}>
                                                {row.category.label}
                                            </Chip>);
                                        if (c.key === "available") return inner(<BooleanSwitch on={row.available}/>);
                                        return inner(row.price !== null
                                            ? <span className="tabular-nums">{row.price.toFixed(2)} <span className="text-text-secondary-dark">EUR</span></span>
                                            : <span className="text-text-disabled-dark">—</span>);
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FiltersDialog — FiltersDialog.tsx */}
                {beat.dialog && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
                        <div className={cls(
                            "dlg bg-white rounded-md dark:bg-surface-950 border", defaultBorderMixin,
                            "rounded-2xl relative overflow-hidden w-11/12 max-w-3xl",
                            "text-surface-accent-900 dark:text-white shadow-lg")}>
                            <Typography variant={"subtitle2"} className={"mt-8 mx-8 mb-3 flex items-center gap-2"}>
                                <span className="typography-h6">Filters</span>
                                {localFilterCount > 0 &&
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-white">
                                        {localFilterCount}
                                    </span>}
                            </Typography>

                            <div className={"flex-grow my-8 mx-8"}>
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="py-3 pr-4 align-middle w-[160px]">
                                                <Typography variant={"body2"} className={"font-medium"}>Name</Typography>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex w-full gap-2">
                                                    <div className={"w-[100px]"}>
                                                        <SelectDisplay size={"medium"} fullWidth>==</SelectDisplay>
                                                    </div>
                                                    <TextFieldDisplay size={"medium"} value={""}/>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className={cls("border-t", defaultBorderMixin)}>
                                            <td className="py-3 pr-4 align-middle w-[160px]">
                                                <Typography variant={"body2"}
                                                            className={cls("font-medium", beat.localPrice && "text-primary")}>
                                                    Price
                                                </Typography>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex w-full gap-2">
                                                    <div className={"w-[100px]"}>
                                                        <SelectDisplay size={"medium"} fullWidth>{beat.localPrice ? ">" : "=="}</SelectDisplay>
                                                    </div>
                                                    <TextFieldDisplay size={"medium"} value={beat.localPrice ? "100" : ""}/>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className={cls("border-t", defaultBorderMixin)}>
                                            <td className="py-3 pr-4 align-middle w-[160px]">
                                                <Typography variant={"body2"}
                                                            className={cls("font-medium", beat.localAvailable && "text-primary")}>
                                                    Available
                                                </Typography>
                                            </td>
                                            <td className="py-3">
                                                <div className="w-full">
                                                    <div className={cls("rounded-md max-w-full justify-between box-border relative inline-flex items-center min-h-[44px] px-4 w-full",
                                                        fieldBackgroundMixin,
                                                        beat.localAvailable ? "text-text-primary dark:text-text-primary-dark" : "text-text-secondary dark:text-text-secondary-dark")}>
                                                        <span className="text-sm">
                                                            {beat.localAvailable ? "Available is true" : "No filter"}
                                                        </span>
                                                        <BooleanSwitch on={beat.localAvailable}/>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className={cls(defaultBorderMixin,
                                "pt-2 pb-4 px-4 border-t flex flex-row items-center justify-end text-right gap-2",
                                "bg-white bg-opacity-60 bg-white/60 dark:bg-surface-900 dark:bg-opacity-60 dark:bg-surface-900/60 backdrop-blur-sm")}>
                                <Button variant={"textNeutral"} size={"medium"}
                                        className={localFilterCount === 0 ? "opacity-50" : undefined}>Clear</Button>
                                <div className="flex-grow"/>
                                <Button variant={"textNeutral"} size={"medium"}>Cancel</Button>
                                <Button variant={"filledPrimary"} size={"medium"}>Apply</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-4 min-h-[24px] text-sm text-surface-400">{beat.caption}</p>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .row { animation: qf-row 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                    .dlg { animation: qf-dlg 200ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                }
                @keyframes qf-row { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
                @keyframes qf-dlg { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: none; } }
            `}</style>
        </div>
    );
}
