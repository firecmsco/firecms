import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * The FireCMS products collection view.
 *
 * This is a faithful reconstruction of the real app's DOM — column widths, row
 * height, cell wrappers, chip styling, switch geometry and the nav rail are
 * taken from the running product rather than invented. Keep it that way: if the
 * app changes, this should be updated from the app's markup, not redesigned.
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
    isPublic: boolean;
    brand: string;
    description: string;
    price: string | null;
};

// Real records from the demo project.
const ROWS: Row[] = [
    {
        id: "B000P0MDMS",
        name: "Baseball Cap",
        image: img("B000P0MDMS-576916726.jpg", "e7091ba7-39fd-43e5-ac3b-230e03f91532"),
        category: { label: "Clothing man", bg: "rgb(102, 102, 102)", fg: "rgb(255, 255, 255)" },
        available: true,
        isPublic: true,
        brand: "Authentic Pigment",
        description: "This stylish baseball cap is made from <strong>100% pigment-dyed cotton denim</strong>, offering a comfortable fit for everyday wear.",
        price: "23.99"
    },
    {
        id: "B000UO4KXY",
        name: "Conceal invisible shelf",
        image: img("B000UO4KXY-825906283.jpg", "ab3371da-0801-466c-b980-bd52a91d40d0"),
        category: { label: "Home storage", bg: "rgb(204, 204, 204)", fg: "rgb(4, 4, 4)" },
        available: true,
        isPublic: true,
        brand: "Umbra",
        description: "The <strong>Conceal Invisible Shelf</strong> is a sleek and modern solution for displaying your most treasured books or items.",
        price: "225"
    },
    {
        id: "B000ZHY0JK",
        name: "Aviator RB 3025",
        image: img("B000ZHY0JK-2047853797.jpg", "9e609a03-5866-4bd3-919b-7f40e599f7e0"),
        category: { label: "Sunglasses", bg: "rgb(255, 220, 229)", fg: "rgb(76, 12, 28)" },
        available: true,
        isPublic: false,
        brand: "Ray-Ban",
        description: "Unisex Sunglasses, Gold, 58 mm. These iconic sunglasses, known for their timeless style and exceptional construction.",
        price: "115"
    },
    {
        id: "B0017TNJWY",
        name: "Wine decanter",
        image: img("B0017TNJWY-528977189.jpg", "690f494a-6a01-4bed-a9da-c9d61ddac4d6"),
        category: { label: "Serveware", bg: "rgb(139, 70, 255)", fg: "rgb(255, 255, 255)" },
        available: false,
        isPublic: false,
        brand: "Sagaform",
        description: "This elegant wine decanter boasts a sophisticated design with a robust oak stopper, with a generous capacity of 2 liters.",
        price: null
    },
    {
        id: "B001A793IW",
        name: "Wobble Chess Set Walnut",
        image: img("B001A793IW-400375460.jpg", "4697b281-c0c2-486b-b986-3f2838f81037"),
        category: { label: "Toys and games", bg: "rgb(11, 118, 183)", fg: "rgb(208, 240, 253)" },
        available: true,
        isPublic: true,
        brand: "Umbra",
        description: "Discover the elegant and playful Wobble Chess Set in Walnut wood. <strong>The board measures 38 x 38 cm</strong>.",
        price: "99"
    }
];

const CATEGORY_ALT: Chip = { label: "Home accessories", bg: "rgb(6, 160, 155)", fg: "rgb(218, 243, 233)" };

// Column widths are the app's own.
const COLS = [
    { key: "id", label: "ID", w: 160, icon: null, justify: "center" },
    { key: "name", label: "Name", w: 185, icon: "short_text", justify: "left" },
    { key: "image", label: "Image", w: 160, icon: "upload_file", justify: "left" },
    { key: "category", label: "Category", w: 145, icon: "list", justify: "left" },
    { key: "available", label: "Available", w: 100, icon: "flag", justify: "center" },
    { key: "public", label: "Public", w: 140, icon: "flag", justify: "center" },
    { key: "currency", label: "Currency", w: 200, icon: "list", justify: "left" },
    { key: "brand", label: "Brand", w: 200, icon: "short_text", justify: "left" },
    { key: "description", label: "Description", w: 300, icon: "format_quote", justify: "left" },
    { key: "price", label: "Price", w: 220, icon: "numbers", justify: "right" }
] as const;

const NAV = [
    { group: "Demo collections", items: [["article", "Blog", false], ["shopping_cart", "Products", true]] },
    { group: "Views", items: [["person", "Users", false], ["bento", "Showcase", false], ["account_balance_wallet", "Crypto", false], ["insert_drive_file", "Pages", false], ["confirmation_number", "Tickets", false]] },
    { group: "Content", items: [["book", "Books", false]] },
    { group: "Custom views", items: [["category", "Additional", false], ["color_lens", "Editor", false], ["video_label", "UI components", false]] },
    { group: "AI", items: [["auto_awesome", "DataTalk", false]] }
] as const;

/** One inline edit, mirroring how a cell focuses and commits in the app. */
const EDITS = [
    { row: 3, col: "available", apply: (r: Row): Row => ({ ...r, available: true }) },
    { row: 2, col: "public", apply: (r: Row): Row => ({ ...r, isPublic: true }) },
    { row: 1, col: "category", apply: (r: Row): Row => ({ ...r, category: CATEGORY_ALT }) },
    { row: 3, col: "available", apply: (r: Row): Row => ({ ...r, available: false }) },
    { row: 2, col: "public", apply: (r: Row): Row => ({ ...r, isPublic: false }) },
    { row: 1, col: "category", apply: (r: Row): Row => ({ ...r, category: { label: "Home storage", bg: "rgb(204, 204, 204)", fg: "rgb(4, 4, 4)" } }) }
];

function MIcon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
    return (
        <span className={"material-icons select-none " + className} style={{ fontSize: `${size}px`, verticalAlign: "middle" }}>
            {name}
        </span>
    );
}

function Switch({ on }: { on: boolean }) {
    return (
        <span
            className={
                "w-[38px] h-[22px] min-w-[38px] min-h-[22px] rounded-full relative shadow-sm inline-block ring-1 " +
                (on ? "ring-secondary bg-secondary" : "bg-surface-accent-900 ring-surface-accent-700")
            }
        >
            <span
                className={
                    "block rounded-full transition-transform duration-100 ease-out w-[19px] h-[19px] mt-[1.5px] " +
                    (on ? "bg-white shadow translate-x-[17px]" : "bg-surface-accent-400 shadow-sm translate-x-[2px]")
                }
            />
        </span>
    );
}

export default function ProductsCollectionDemo({ height = 700 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [rows, setRows] = useState<Row[]>(ROWS);
    const [step, setStep] = useState(0);
    const [focused, setFocused] = useState<{ row: number; col: string } | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // The app renders its icons as Material Icons ligatures; load the font here
    // so the component works wherever it is mounted.
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
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        const edit = EDITS[step % EDITS.length];
        if (!focused) {
            timer.current = setTimeout(() => setFocused({ row: edit.row, col: edit.col }), 900);
        } else {
            timer.current = setTimeout(() => {
                setRows(rs => rs.map((r, i) => (i === edit.row ? edit.apply(r) : r)));
                setFocused(null);
                setStep(s => s + 1);
            }, 700);
        }
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [step, focused, inView]);

    const cell = (rowIdx: number, col: string, justify: string, w: number, children: React.ReactNode, pad = "p-2") => {
        const isFocused = focused?.row === rowIdx && focused?.col === col;
        return (
            <div className="flex-shrink-0" style={{ minWidth: w, maxWidth: w, width: w }}>
                <div
                    className={
                        "transition-colors duration-100 ease-in-out flex relative h-full rounded-md border-4 overflow-hidden " +
                        pad + " " + (isFocused ? "border-primary" : "border-transparent")
                    }
                    style={{ justifyContent: justify === "center" ? "center" : justify === "right" ? "flex-end" : "flex-start", alignItems: "center" }}
                >
                    <div className="flex flex-col max-h-full w-full">
                        <div style={{ display: "flex", width: "100%", justifyContent: justify === "center" ? "center" : justify === "right" ? "flex-end" : "flex-start" }}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            ref={ref}
            className="flex w-full select-none overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 text-white"
            style={{ height }}
            aria-label="The FireCMS products collection view, with typed columns and a value being edited inline in the table"
        >
            {/* Nav rail */}
            <div className="w-[72px] min-w-[72px] shrink-0 flex-col border-r border-surface-700/40 bg-surface-900 hidden sm:flex">
                <div className="flex items-center justify-center h-[56px] shrink-0">
                    <svg width="26" height="26" viewBox="0 0 583 583" fill="none" aria-hidden="true">
                        <circle cx="291.5" cy="291.5" r="291.5" fill="#0070F4"/>
                        <ellipse cx="292" cy="291.5" rx="173" ry="173.5" fill="#FF3773"/>
                        <path d="M465 291.5C465 268.847 460.525 246.416 451.831 225.487C443.137 204.558 430.394 185.542 414.329 169.524C398.265 153.506 379.194 140.8 358.204 132.131C337.215 123.462 314.719 119 292 119C269.281 119 246.785 123.462 225.796 132.131C204.806 140.8 185.735 153.506 169.671 169.524C153.606 185.542 140.863 204.558 132.169 225.487C123.475 246.416 119 268.847 119 291.5L292 291.5H465Z" fill="#FFA400"/>
                    </svg>
                </div>
                <div className="flex-grow overflow-hidden px-2">
                    {NAV.map(section => (
                        <div key={section.group} className="my-2 mx-2 flex flex-col">
                            {section.items.map(([icon, label, active]) => (
                                <div
                                    key={label as string}
                                    className={
                                        "rounded-lg flex flex-row items-center h-[30px] font-medium text-[13px] " +
                                        (active ? "bg-primary/10 text-primary" : "text-surface-300")
                                    }
                                    title={label as string}
                                >
                                    <div className={"shrink-0 flex items-center justify-center w-[44px] h-[30px] " + (active ? "text-primary" : "text-text-secondary-dark")}>
                                        <MIcon name={icon as string} size={18}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Top bar */}
                <div className="flex h-16 shrink-0 items-center gap-2 px-4">
                    <h6 className="text-[15px] font-medium text-white truncate">My demo app</h6>
                    <p className="text-[12px] text-text-secondary-dark">/</p>
                    <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                        <p className="text-[13px] text-white">Products</p>
                        <span className="text-xs text-surface-accent-400 bg-surface-700 px-1 py-0 rounded">256</span>
                    </div>
                    <div className="flex-grow"/>
                    <MIcon name="dark_mode" className="text-surface-accent-300"/>
                    <MIcon name="translate" className="text-surface-accent-300"/>
                    <span className="ml-1 h-8 w-8 rounded-full bg-surface-accent-800"/>
                </div>

                {/* Collection container */}
                <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-surface-700/40">
                    {/* Toolbar */}
                    <div className="flex min-h-[52px] shrink-0 flex-row items-center justify-between border-b border-surface-700/40 bg-surface-900 px-4">
                        <div className="flex items-center gap-1 mr-4">
                            <span className="inline-flex items-center gap-2 rounded-lg bg-surface-700 px-2 py-1 text-text-primary-dark">
                                <MIcon name="list"/>
                                <span className="ml-1 text-sm">List</span>
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-text-primary-dark">
                                <MIcon name="filter_list" className="text-surface-accent-300"/>
                                <span className="text-sm">Filters</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="relative flex h-[36px] items-center rounded-lg border border-surface-700/40 bg-surface-800 px-2">
                                <MIcon name="search" className="text-text-disabled-dark"/>
                                <span className="pl-2 pr-6 text-sm text-text-disabled-dark">Search</span>
                            </div>
                            <span className="px-4 py-2 text-sm text-text-primary-dark">Demo action</span>
                            <MIcon name="download" className="text-surface-accent-300 mx-1"/>
                            <MIcon name="upload" className="text-surface-accent-300 mx-1"/>
                            <MIcon name="settings" className="text-surface-accent-300 mx-1"/>
                            <span className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-white">
                                <MIcon name="add"/>
                                Add Product
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="min-h-0 flex-1 overflow-hidden bg-surface-950">
                        {/* Header row */}
                        <div className="flex h-12 w-fit min-w-full flex-row border-b border-surface-800/40 bg-surface-900">
                            {COLS.map(c => (
                                <div key={c.key} className="h-full flex-shrink-0" style={{ minWidth: c.w, maxWidth: c.w, width: c.w }}>
                                    <div className="flex h-full items-center px-3 py-0 text-xs font-semibold uppercase text-text-secondary-dark">
                                        <div className="flex-grow overflow-hidden">
                                            <div className={"flex flex-row items-center " + (c.justify === "center" ? "justify-center" : c.justify === "right" ? "justify-end" : "")}>
                                                {c.icon && <MIcon name={c.icon}/>}
                                                <div className="truncate mx-1">{c.label}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Rows — 140px, as in the app */}
                        {rows.map((row, i) => (
                            <div key={row.id} className="flex min-w-full w-fit text-sm border-b border-surface-800/40" style={{ height: 140 }}>
                                {/* ID: sticky action column */}
                                <div className="flex-shrink-0 bg-surface-950" style={{ minWidth: 160, maxWidth: 160, width: 160 }}>
                                    <div className="flex h-full flex-col items-center justify-center bg-surface-900/90">
                                        <div className="flex w-full justify-center text-surface-accent-300">
                                            <MIcon name="edit" className="mx-1"/>
                                            <MIcon name="more_vert" size={24} className="mx-1"/>
                                            <span className="mx-1 mt-0.5 h-5 w-5 rounded border-2 border-surface-accent-500"/>
                                        </div>
                                        <div className="mt-1 w-[138px] truncate px-2 text-center font-mono text-xs text-text-secondary-dark">
                                            {row.id}
                                        </div>
                                    </div>
                                </div>

                                {cell(i, "name", "left", 185, <span>{row.name}</span>)}

                                {cell(i, "image", "left", 160,
                                    <div className="relative p-2">
                                        <img
                                            className="rounded-md"
                                            src={row.image}
                                            alt=""
                                            loading="lazy"
                                            style={{ width: 100, height: 100, objectFit: "contain" }}
                                        />
                                    </div>, "p-0")}

                                {cell(i, "category", "left", 145,
                                    <div
                                        className="rounded-lg w-max max-w-full h-fit font-medium inline-flex items-center gap-1 px-3 py-1 text-sm transition-colors duration-150"
                                        style={{ backgroundColor: row.category.bg, color: row.category.fg, overflow: "hidden" }}
                                    >
                                        {row.category.label}
                                    </div>)}

                                {cell(i, "available", "center", 100, <Switch on={row.available}/>)}
                                {cell(i, "public", "center", 140, <Switch on={row.isPublic}/>)}

                                {cell(i, "currency", "left", 200,
                                    <div
                                        className="rounded-lg w-max max-w-full h-fit font-medium inline-flex items-center gap-1 px-3 py-1 text-sm"
                                        style={{ backgroundColor: "rgb(45, 127, 249)", color: "rgb(255, 255, 255)" }}
                                    >
                                        Euros
                                    </div>)}

                                {cell(i, "brand", "left", 200, <span>{row.brand}</span>)}

                                {cell(i, "description", "left", 300,
                                    <div
                                        className="prose-sm text-[13px] leading-5 text-surface-300"
                                        style={{ maskImage: "linear-gradient(black 60%, transparent 100%)" }}
                                        dangerouslySetInnerHTML={{ __html: row.description }}
                                    />)}

                                {cell(i, "price", "right", 220,
                                    row.price
                                        ? <div>{row.price}</div>
                                        : <div className="text-sm text-zinc-500">Not available</div>)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
