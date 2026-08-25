import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * One deployment, three people, three different panels.
 *
 * Permissions are the claim on /firebase-admin-panel that the Firebase console
 * cannot answer at all, so it gets its own demo rather than a paragraph. The
 * chrome (nav drawer, top bar, toolbar, table geometry, chip and switch styling)
 * is the app's own — see ProductsCollectionDemo, which this mirrors. Keep it
 * matching the product rather than redesigning it.
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
    price: string | null;
};

const ROWS: Row[] = [
    {
        id: "B000P0MDMS",
        name: "Baseball Cap",
        image: img("B000P0MDMS-576916726.jpg", "e7091ba7-39fd-43e5-ac3b-230e03f91532"),
        category: { label: "Clothing man", bg: "rgb(102, 102, 102)", fg: "rgb(255, 255, 255)" },
        available: true,
        price: "23.99"
    },
    {
        id: "B000UO4KXY",
        name: "Conceal invisible shelf",
        image: img("B000UO4KXY-825906283.jpg", "ab3371da-0801-466c-b980-bd52a91d40d0"),
        category: { label: "Home storage", bg: "rgb(204, 204, 204)", fg: "rgb(4, 4, 4)" },
        available: true,
        price: "225"
    },
    {
        id: "B000ZHY0JK",
        name: "Aviator RB 3025",
        image: img("B000ZHY0JK-2047853797.jpg", "9e609a03-5866-4bd3-919b-7f40e599f7e0"),
        category: { label: "Sunglasses", bg: "rgb(255, 220, 229)", fg: "rgb(76, 12, 28)" },
        available: true,
        price: "115"
    },
    {
        id: "B0017TNJWY",
        name: "Wine decanter",
        image: img("B0017TNJWY-528977189.jpg", "690f494a-6a01-4bed-a9da-c9d61ddac4d6"),
        category: { label: "Serveware", bg: "rgb(139, 70, 255)", fg: "rgb(255, 255, 255)" },
        available: false,
        price: null
    }
];

const COLS = [
    { key: "id", label: "ID", w: 150, icon: null, justify: "center" },
    { key: "name", label: "Name", w: 190, icon: "short_text", justify: "left" },
    { key: "image", label: "Image", w: 130, icon: "upload_file", justify: "left" },
    { key: "category", label: "Category", w: 150, icon: "list", justify: "left" },
    { key: "available", label: "Available", w: 110, icon: "flag", justify: "center" },
    { key: "price", label: "Price", w: 170, icon: "numbers", justify: "right" }
] as const;

/** Every collection in the app, in drawer order. */
const ALL_NAV = [
    { group: "Demo collections", items: [["article", "Blog"], ["shopping_cart", "Products"]] },
    { group: "Views", items: [["person", "Users"], ["confirmation_number", "Tickets"], ["insert_drive_file", "Pages"]] },
    { group: "Settings", items: [["admin_panel_settings", "Roles"], ["group", "Users & access"]] }
] as const;

type Role = {
    key: string;
    label: string;
    who: string;
    initials: string;
    tint: string;
    /** Collections this role can see at all. */
    visible: string[];
    canCreate: boolean;
    canDelete: boolean;
    /** Columns this role may read but not write. */
    locked: string[];
    summary: string;
};

const ROLES: Role[] = [
    {
        key: "admin",
        label: "Admin",
        who: "you@yourteam.com",
        initials: "YT",
        tint: "rgb(45, 127, 249)",
        visible: ["Blog", "Products", "Users", "Tickets", "Pages", "Roles", "Users & access"],
        canCreate: true,
        canDelete: true,
        locked: [],
        summary: "Every collection, every field, plus role management."
    },
    {
        key: "editor",
        label: "Content editor",
        who: "marta@yourteam.com",
        initials: "MR",
        tint: "rgb(6, 160, 155)",
        visible: ["Blog", "Products", "Pages"],
        canCreate: true,
        canDelete: false,
        locked: ["price"],
        summary: "Creates and edits content. Cannot delete, and cannot touch pricing."
    },
    {
        key: "support",
        label: "Support",
        who: "sam@yourteam.com",
        initials: "SK",
        tint: "rgb(139, 70, 255)",
        visible: ["Products", "Users", "Tickets"],
        canCreate: false,
        canDelete: false,
        locked: ["id", "name", "image", "category", "available", "price"],
        summary: "Read-only. Looks things up for customers, changes nothing."
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

function Switch({ on, dim }: { on: boolean; dim: boolean }) {
    return (
        <span
            className={
                "w-[38px] h-[22px] min-w-[38px] min-h-[22px] rounded-full relative shadow-sm inline-block ring-1 transition-opacity duration-300 " +
                (on ? "ring-secondary bg-secondary" : "bg-surface-accent-900 ring-surface-accent-700") +
                (dim ? " opacity-40" : "")
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

export default function RolePermissionsDemo({ height = 620 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [idx, setIdx] = useState(0);
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

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        timer.current = setTimeout(() => setIdx(i => (i + 1) % ROLES.length), 3600);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [idx, inView]);

    const role = ROLES[idx];
    const isLocked = (col: string) => role.locked.includes(col);

    return (
        <div ref={ref} className="w-full select-none">
            {/* Role switcher — the frame of the whole demo, not chrome inside it. */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-surface-500">
                    Signed in as
                </span>
                <div className="flex flex-wrap gap-1.5 rounded-xl border border-surface-800 bg-surface-900/70 p-1.5">
                    {ROLES.map((r, i) => {
                        const on = i === idx;
                        return (
                            <span
                                key={r.key}
                                className={
                                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 " +
                                    (on ? "text-white" : "text-surface-500")
                                }
                                style={on ? { backgroundColor: r.tint } : undefined}
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                                      style={{
                                          backgroundColor: on ? "rgba(255,255,255,0.22)" : "rgb(38,38,42)",
                                          color: on ? "#fff" : "rgb(140,140,150)"
                                      }}>
                                    {r.initials}
                                </span>
                                {r.label}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div
                className="flex w-full overflow-hidden rounded-2xl border border-surface-800 bg-surface-900 text-white"
                style={{ height }}
                aria-label="The same FireCMS admin panel seen by an admin, a content editor and a support agent, with collections, actions and fields changing per role"
            >
                {/* Nav drawer — labelled, so the collections a role loses are visible */}
                <div className="hidden w-[218px] min-w-[218px] shrink-0 flex-col border-r border-surface-700/40 bg-surface-900 md:flex">
                    <div className="flex h-[56px] shrink-0 items-center gap-2.5 px-4">
                        <svg width="24" height="24" viewBox="0 0 583 583" fill="none" aria-hidden="true">
                            <circle cx="291.5" cy="291.5" r="291.5" fill="#0070F4"/>
                            <ellipse cx="292" cy="291.5" rx="173" ry="173.5" fill="#FF3773"/>
                            <path d="M465 291.5C465 268.847 460.525 246.416 451.831 225.487C443.137 204.558 430.394 185.542 414.329 169.524C398.265 153.506 379.194 140.8 358.204 132.131C337.215 123.462 314.719 119 292 119C269.281 119 246.785 123.462 225.796 132.131C204.806 140.8 185.735 153.506 169.671 169.524C153.606 185.542 140.863 204.558 132.169 225.487C123.475 246.416 119 268.847 119 291.5L292 291.5H465Z" fill="#FFA400"/>
                        </svg>
                        <span className="text-[13px] font-medium text-surface-300">My demo app</span>
                    </div>

                    <div className="flex-grow overflow-hidden px-3 pt-1">
                        {ALL_NAV.map(section => {
                            const items = section.items.filter(([, label]) => role.visible.includes(label as string));
                            return (
                                <div key={section.group}
                                     className="overflow-hidden transition-all duration-300 ease-out"
                                     style={{ maxHeight: items.length ? 260 : 0, opacity: items.length ? 1 : 0 }}>
                                    <div className="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.11em] text-surface-600">
                                        {section.group}
                                    </div>
                                    {section.items.map(([icon, label]) => {
                                        const shown = role.visible.includes(label as string);
                                        const active = label === "Products";
                                        return (
                                            <div
                                                key={label as string}
                                                className="overflow-hidden transition-all duration-300 ease-out"
                                                style={{
                                                    maxHeight: shown ? 34 : 0,
                                                    opacity: shown ? 1 : 0,
                                                    transform: shown ? "none" : "translateX(-8px)"
                                                }}
                                            >
                                                <div className={
                                                    "mb-0.5 flex h-[30px] flex-row items-center rounded-lg pr-2 text-[13px] font-medium " +
                                                    (active ? "bg-primary/10 text-primary" : "text-surface-300")
                                                }>
                                                    <div className={"flex h-[30px] w-[38px] shrink-0 items-center justify-center " + (active ? "text-primary" : "text-text-secondary-dark")}>
                                                        <MIcon name={icon as string} size={18}/>
                                                    </div>
                                                    <span className="truncate">{label}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    <div className="shrink-0 border-t border-surface-800 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white transition-colors duration-300"
                                  style={{ backgroundColor: role.tint }}>
                                {role.initials}
                            </span>
                            <span key={role.key} className="role-fade min-w-0 flex-1">
                                <span className="block truncate text-[11.5px] leading-tight text-surface-300">{role.who}</span>
                                <span className="block truncate text-[10.5px] leading-tight text-surface-600">{role.label}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Top bar */}
                    <div className="flex h-16 shrink-0 items-center gap-2 px-4">
                        <h6 className="truncate text-[15px] font-medium text-white">My demo app</h6>
                        <p className="text-[12px] text-text-secondary-dark">/</p>
                        <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                            <p className="text-[13px] text-white">Products</p>
                            <span className="rounded bg-surface-700 px-1 py-0 text-xs text-surface-accent-400">256</span>
                        </div>
                        <div className="flex-grow"/>
                        <span
                            className="rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200"
                            style={{ backgroundColor: role.tint + "1f", color: role.tint }}
                        >
                            {role.label}
                        </span>
                    </div>

                    {/* Collection container */}
                    <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-surface-700/40">
                        {/* Toolbar */}
                        <div className="flex min-h-[52px] shrink-0 flex-row items-center justify-between border-b border-surface-700/40 bg-surface-900 px-4">
                            <div className="mr-4 flex items-center gap-1">
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
                                <span
                                    className="mx-1 transition-opacity duration-300"
                                    style={{ opacity: role.canDelete ? 1 : 0.25 }}
                                    title={role.canDelete ? "Delete" : "Delete — not permitted"}
                                >
                                    <MIcon name="delete" className="text-surface-accent-300"/>
                                </span>
                                <MIcon name="download" className="mx-1 text-surface-accent-300"/>
                                <span
                                    className={
                                        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300 " +
                                        (role.canCreate
                                            ? "border-primary bg-primary text-white"
                                            : "border-surface-700 bg-surface-800 text-surface-600")
                                    }
                                >
                                    <MIcon name={role.canCreate ? "add" : "lock"} size={18}/>
                                    Add Product
                                </span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="min-h-0 flex-1 overflow-hidden bg-surface-950">
                            <div className="flex h-12 w-fit min-w-full flex-row border-b border-surface-800/40 bg-surface-900">
                                {COLS.map(c => (
                                    <div key={c.key} className="h-full flex-shrink-0" style={{ minWidth: c.w, maxWidth: c.w, width: c.w }}>
                                        <div className="flex h-full items-center gap-1.5 px-3 text-xs font-semibold uppercase text-text-secondary-dark">
                                            {c.icon && <MIcon name={c.icon} size={16} className="text-surface-accent-500"/>}
                                            <span className="truncate">{c.label}</span>
                                            <span
                                                className="transition-opacity duration-300"
                                                style={{ opacity: isLocked(c.key) ? 1 : 0 }}
                                                title="Read-only for this role"
                                            >
                                                <MIcon name="lock" size={13} className="text-surface-accent-500"/>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {ROWS.map(r => (
                                <div key={r.id} className="flex w-fit min-w-full flex-row items-center border-b border-surface-800/40" style={{ height: 104 }}>
                                    {COLS.map(c => {
                                        const locked = isLocked(c.key);
                                        const base = "flex h-full items-center px-3 transition-opacity duration-300 flex-shrink-0";
                                        const style = { minWidth: c.w, maxWidth: c.w, width: c.w, opacity: locked ? 0.55 : 1,
                                                        justifyContent: c.justify === "center" ? "center" : c.justify === "right" ? "flex-end" : "flex-start" } as React.CSSProperties;
                                        if (c.key === "id")
                                            return <div key={c.key} className={base} style={style}>
                                                <span className="truncate font-mono text-[11px] text-surface-500">{r.id}</span></div>;
                                        if (c.key === "name")
                                            return <div key={c.key} className={base} style={style}>
                                                <span className="truncate text-[13.5px] text-white">{r.name}</span></div>;
                                        if (c.key === "image")
                                            return <div key={c.key} className={base} style={style}>
                                                <img src={r.image} alt="" loading="lazy" width={72} height={72}
                                                     className="h-[72px] w-[72px] rounded-md object-cover"/></div>;
                                        if (c.key === "category")
                                            return <div key={c.key} className={base} style={style}>
                                                <span className="truncate rounded-lg px-2 py-1 text-[13px]"
                                                      style={{ backgroundColor: r.category.bg, color: r.category.fg }}>
                                                    {r.category.label}</span></div>;
                                        if (c.key === "available")
                                            return <div key={c.key} className={base} style={style}>
                                                <Switch on={r.available} dim={locked}/></div>;
                                        return (
                                            <div key={c.key} className={base} style={style}>
                                                {r.price
                                                    ? <span className="text-[13.5px] tabular-nums text-white">{r.price}
                                                        <span className="ml-1 text-surface-500">EUR</span></span>
                                                    : <span className="text-[13px] text-surface-600">—</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <p key={role.key} className="role-fade mt-4 min-h-[24px] text-sm text-surface-400">
                <span className="font-medium text-white">{role.label}:</span> {role.summary}
            </p>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .role-fade { animation: rpd-fade 260ms ease-out backwards; }
                }
                @keyframes rpd-fade { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}
