import React, { useState, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────
interface EntityField {
    key: string;
    label: string;
    type: "text" | "number" | "boolean" | "select" | "date" | "reference" | "textarea" | "email" | "url";
    icon: string; // SVG path
    value: any;
    options?: { value: string; label: string }[];
    required?: boolean;
    description?: string;
}

interface Entity {
    id: string;
    values: Record<string, any>;
}

// ─── SVG icon paths (for field-type icons) ──────────────
const ICON = {
    text: "M4 6h16M4 12h8m-8 6h16",
    number: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
    email: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    url: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    select: "M8 9l4-4 4 4m0 6l-4 4-4-4",
    boolean: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    textarea: "M4 6h16M4 10h16M4 14h10",
    date: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    reference: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101",
};

// ─── Mock Data ───────────────────────────────────────────
const ENTITY_FIELDS: EntityField[] = [
    { key: "title", label: "Title", type: "text", icon: ICON.text, value: "Getting Started with Rebase", required: true, description: "The main display title of the post" },
    { key: "slug", label: "Slug", type: "text", icon: ICON.text, value: "getting-started-with-rebase", description: "URL-friendly identifier" },
    { key: "status", label: "Status", type: "select", icon: ICON.select, value: "published", options: [
        { value: "draft", label: "Draft" },
        { value: "review", label: "In Review" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
    ]},
    { key: "author_email", label: "Author Email", type: "email", icon: ICON.email, value: "alice@example.com" },
    { key: "category", label: "Category", type: "select", icon: ICON.select, value: "tutorial", options: [
        { value: "tutorial", label: "Tutorial" },
        { value: "guide", label: "Guide" },
        { value: "announcement", label: "Announcement" },
        { value: "changelog", label: "Changelog" },
    ]},
    { key: "featured", label: "Featured", type: "boolean", icon: ICON.boolean, value: true },
    { key: "view_count", label: "View Count", type: "number", icon: ICON.number, value: 1542 },
    { key: "published_at", label: "Published At", type: "date", icon: ICON.date, value: "2025-03-15" },
    { key: "excerpt", label: "Excerpt", type: "textarea", icon: ICON.textarea, value: "Learn how to set up your first Rebase admin panel in under 5 minutes. Connect your existing Postgres database and get a complete admin UI automatically.", description: "Short summary shown in lists" },
    { key: "external_url", label: "External URL", type: "url", icon: ICON.url, value: "https://rebase.pro/docs/quickstart" },
];

const MOCK_ENTITIES: Entity[] = [
    { id: "111094", values: { title: "Getting Started with Rebase", status: "published", author_email: "alice@example.com", view_count: 1542, published_at: "2025-03-15" }},
    { id: "1410", values: { title: "Schema Migrations Guide", status: "published", author_email: "bob@example.com", view_count: 892, published_at: "2025-02-20" }},
    { id: "20", values: { title: "Custom Views Tutorial", status: "draft", author_email: "alice@example.com", view_count: 234, published_at: null }},
    { id: "19", values: { title: "RLS Best Practices", status: "published", author_email: "eve@example.com", view_count: 2103, published_at: "2025-01-10" }},
    { id: "18", values: { title: "REST API Deep Dive", status: "review", author_email: "bob@example.com", view_count: 67, published_at: null }},
    { id: "17", values: { title: "Data Import Tutorial", status: "draft", author_email: "alice@example.com", view_count: 0, published_at: null }},
];

const STATUS_BADGE: Record<string, string> = {
    draft: "bg-surface-700 text-surface-300",
    review: "bg-amber-950 text-amber-300",
    published: "bg-green-950 text-green-300",
    archived: "bg-red-950 text-red-300",
};

// ─── Helpers ─────────────────────────────────────────────
function FieldIcon({ d, className = "" }: { d: string; className?: string }) {
    return (
        <svg className={`w-4 h-4 shrink-0 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
        </svg>
    );
}

// ─── Component ───────────────────────────────────────────
export function EntityViewDemo() {
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Record<string, any>>(
        Object.fromEntries(ENTITY_FIELDS.map(f => [f.key, f.value]))
    );
    const [isSaving, setIsSaving] = useState(false);
    const [formDirty, setFormDirty] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<"list" | "board">("list");

    const panelOpen = selectedEntityId !== null;

    const handleFieldChange = useCallback((key: string, value: any) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
        setFormDirty(true);
    }, []);

    const handleSave = useCallback(() => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setFormDirty(false);
        }, 800);
    }, []);

    const openEntity = useCallback((entityId: string) => {
        setSelectedEntityId(entityId);
        const entity = MOCK_ENTITIES.find(e => e.id === entityId);
        if (entity) {
            setFormValues(prev => ({ ...prev, ...entity.values }));
        }
        setFormDirty(false);
    }, []);

    const closePanel = useCallback(() => {
        setSelectedEntityId(null);
        setFormDirty(false);
    }, []);

    // Animation Loop
    useEffect(() => {
        let isMounted = true;
        let timer: any = null;

        const loop = async () => {
            while (isMounted) {
                // Wait 1.5s then hover row
                await new Promise(r => { timer = setTimeout(r, 1500); });
                if (!isMounted) return;
                setHoveredRow("1410");

                // Wait 0.5s then open panel
                await new Promise(r => { timer = setTimeout(r, 500); });
                if (!isMounted) return;
                openEntity("1410");

                // Wait 1.5s then change status
                await new Promise(r => { timer = setTimeout(r, 1500); });
                if (!isMounted) return;
                handleFieldChange("status", "review");

                // Wait 1.5s then save
                await new Promise(r => { timer = setTimeout(r, 1500); });
                if (!isMounted) return;
                setIsSaving(true);

                // Save takes 0.8s
                await new Promise(r => { timer = setTimeout(r, 800); });
                if (!isMounted) return;
                setIsSaving(false);
                setFormDirty(false);

                // Wait 1s then close
                await new Promise(r => { timer = setTimeout(r, 1000); });
                if (!isMounted) return;
                closePanel();
                setHoveredRow(null);

                // Switch to BOARD view
                await new Promise(r => { timer = setTimeout(r, 1000); });
                if (!isMounted) return;
                setActiveView("board");

                // Hover a board card or just wait showing the board
                await new Promise(r => { timer = setTimeout(r, 4000); });
                if (!isMounted) return;

                // Back to LIST view
                setActiveView("list");
                await new Promise(r => { timer = setTimeout(r, 1000); });
                if (!isMounted) return;

                // Wait 1s then do another row
                await new Promise(r => { timer = setTimeout(r, 1000); });
                if (!isMounted) return;

                setHoveredRow("20");
                await new Promise(r => { timer = setTimeout(r, 500); });
                if (!isMounted) return;
                openEntity("20");

                await new Promise(r => { timer = setTimeout(r, 1500); });
                if (!isMounted) return;
                handleFieldChange("published_at", "2025-05-01");

                await new Promise(r => { timer = setTimeout(r, 1500); });
                if (!isMounted) return;
                setIsSaving(true);
                await new Promise(r => { timer = setTimeout(r, 800); });
                if (!isMounted) return;
                setIsSaving(false);
                setFormDirty(false);

                await new Promise(r => { timer = setTimeout(r, 1000); });
                if (!isMounted) return;
                closePanel();
                setHoveredRow(null);
            }
        };

        loop();

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [openEntity, closePanel, handleFieldChange]);

    return (
        <div className="relative h-[600px] w-full rounded-xl overflow-hidden ring-1 ring-surface-700 bg-surface-950 shadow-2xl text-surface-300 text-sm pointer-events-none select-none">
            {/* ── Full-width Table ── */}
            <div className="flex flex-col h-full">
                {/* Collection toolbar — matches real product: breadcrumb + LIST/FILTERS + actions */}
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-surface-800/40 bg-surface-900/50 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs text-surface-400">
                            <svg className="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                            <span className="text-surface-600">/</span>
                            <span className="text-white font-medium">Posts</span>
                        </div>
                        {/* View mode toggles */}
                        <div className="flex items-center gap-0.5 rounded bg-surface-800/40 p-0.5">
                            <button
                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                                    activeView === "list" ? "text-white bg-surface-700/80" : "text-surface-500 hover:text-surface-300"
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                                LIST
                            </button>
                            <button
                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                                    activeView === "board" ? "text-white bg-surface-700/80" : "text-surface-500 hover:text-surface-300"
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="13" rx="1"/></svg>
                                BOARD
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-surface-500 hover:text-surface-300 transition-colors border-l border-surface-700/40 ml-0.5 pl-2.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                                FILTERS
                            </button>
                        </div>
                        {/* Save / Undo */}
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded text-surface-500 hover:text-surface-300 transition-colors" title="Save">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                            </button>
                            <button className="p-1.5 rounded text-surface-500 hover:text-surface-300 transition-colors" title="Undo">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded text-surface-500 hover:text-surface-300 transition-colors" title="Settings">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </button>
                        <button className="p-1.5 rounded text-surface-500 hover:text-surface-300 transition-colors" title="Delete selected">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                        <span className="text-[10px] text-surface-600 font-mono">(0)</span>
                        <button
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/80 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                            ADD POST
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                {activeView === "list" && (
                    <>
                        {/* Table header row — with column icons and filter/sort per col */}
                        <div className="flex items-center border-b border-surface-800/40 bg-surface-900/40 text-[10px] uppercase tracking-wider text-surface-500 shrink-0 select-none">
                            {/* Actions col header */}
                            <div className="w-[100px] shrink-0 flex items-center px-2 py-2">
                                <span className="font-bold">ID</span>
                                <svg className="w-3 h-3 ml-1 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </div>
                            <div className="w-[60px] shrink-0 flex items-center justify-center px-2 py-2">
                                <span className="font-bold"># ID</span>
                            </div>
                            {/* Title */}
                            <div className="flex-1 min-w-[200px] flex items-center px-3 py-2 gap-1">
                                <svg className="w-3 h-3 text-surface-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON.text}/></svg>
                                <span className="font-bold">Title</span>
                                <svg className="w-3 h-3 ml-auto text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                            </div>
                            {/* Status */}
                            <div className="w-[110px] shrink-0 flex items-center px-3 py-2 gap-1">
                                <svg className="w-3 h-3 text-surface-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON.select}/></svg>
                                <span className="font-bold">Status</span>
                                <svg className="w-3 h-3 ml-auto text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                            </div>
                            {/* Author */}
                            <div className="w-[180px] shrink-0 flex items-center px-3 py-2 gap-1">
                                <svg className="w-3 h-3 text-surface-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON.email}/></svg>
                                <span className="font-bold">Author</span>
                                <svg className="w-3 h-3 ml-auto text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                            </div>
                            {/* Views */}
                            <div className="w-[90px] shrink-0 flex items-center px-3 py-2 gap-1">
                                <svg className="w-3 h-3 text-surface-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON.number}/></svg>
                                <span className="font-bold">Views</span>
                            </div>
                            {/* Published */}
                            <div className="w-[120px] shrink-0 flex items-center px-3 py-2 gap-1">
                                <svg className="w-3 h-3 text-surface-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON.date}/></svg>
                                <span className="font-bold">Published</span>
                            </div>
                            {/* Add column */}
                            <div className="w-[40px] shrink-0 flex items-center justify-center px-2 py-2">
                                <svg className="w-3.5 h-3.5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                            </div>
                        </div>

                        {/* Table body */}
                        <div className="flex-1 overflow-auto">
                            {MOCK_ENTITIES.map(entity => (
                                <div
                                    key={entity.id}
                                    onClick={() => openEntity(entity.id)}
                                    onMouseEnter={() => setHoveredRow(entity.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    className={`flex items-center border-b border-surface-800/20 cursor-pointer transition-colors min-h-[64px] ${
                                        selectedEntityId === entity.id ? "bg-primary/5" : "hover:bg-surface-800/20"
                                    }`}
                                >
                                    {/* Action column: edit pencil, kebab, checkbox */}
                                    <div className="w-[100px] shrink-0 flex items-center gap-1 px-2">
                                        <button
                                            className={`p-1 rounded transition-opacity ${hoveredRow === entity.id ? "opacity-100" : "opacity-30"} hover:bg-surface-700/60 text-surface-400 hover:text-white`}
                                            onClick={e => { e.stopPropagation(); openEntity(entity.id); }}
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                        </button>
                                        <button
                                            className={`p-1 rounded transition-opacity ${hoveredRow === entity.id ? "opacity-100" : "opacity-30"} hover:bg-surface-700/60 text-surface-400 hover:text-white`}
                                            onClick={e => e.stopPropagation()}
                                            title="More"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                                        </button>
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-surface-600 cursor-pointer accent-primary ml-0.5"
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </div>
                                    {/* ID */}
                                    <div className="w-[60px] shrink-0 px-2 text-xs text-surface-500 font-mono text-center">
                                        {entity.id}
                                    </div>
                                    {/* Title */}
                                    <div className="flex-1 min-w-[200px] px-3 py-3 text-sm text-surface-200 font-medium truncate">
                                        {entity.values.title}
                                    </div>
                                    {/* Status */}
                                    <div className="w-[110px] shrink-0 px-3 py-3">
                                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[entity.values.status] ?? STATUS_BADGE.draft}`}>
                                            {entity.values.status}
                                        </span>
                                    </div>
                                    {/* Author */}
                                    <div className="w-[180px] shrink-0 px-3 py-3 text-xs text-surface-400 truncate">
                                        {entity.values.author_email}
                                    </div>
                                    {/* Views */}
                                    <div className="w-[90px] shrink-0 px-3 py-3 text-xs text-surface-400 font-mono text-right">
                                        {entity.values.view_count?.toLocaleString()}
                                    </div>
                                    {/* Published */}
                                    <div className="w-[120px] shrink-0 px-3 py-3 text-xs text-surface-500">
                                        {entity.values.published_at ?? "—"}
                                    </div>
                                    {/* Spacer for + col */}
                                    <div className="w-[40px] shrink-0" />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Board view */}
                {activeView === "board" && (
                    <div className="flex-1 overflow-x-auto p-4 bg-surface-950/50 flex gap-4">
                        {(["draft", "review", "published"] as const).map(statusCategory => {
                            const columnEntities = MOCK_ENTITIES.filter(e => e.values.status === statusCategory);
                            return (
                                <div key={statusCategory} className="flex-shrink-0 w-[280px] flex flex-col gap-3">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${statusCategory === 'draft' ? "bg-surface-400" : statusCategory === 'review' ? "bg-amber-400" : "bg-green-400"}`} />
                                            <span className="font-semibold text-xs text-surface-300 uppercase tracking-widest">{statusCategory}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-800 text-surface-400">{columnEntities.length}</span>
                                        </div>
                                        <button className="text-surface-500 hover:text-white transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                                        </button>
                                    </div>
                                    {/* Column Body */}
                                    <div className="flex-1 flex flex-col gap-2">
                                        {columnEntities.map(entity => (
                                            <div 
                                                key={entity.id}
                                                className={`p-3 rounded-lg bg-surface-900 border ${selectedEntityId === entity.id ? "border-primary" : "border-surface-700/50"} shadow-md cursor-pointer hover:border-surface-600 transition-colors`}
                                                onClick={() => openEntity(entity.id)}
                                            >
                                                <h4 className="text-sm font-medium text-surface-200 line-clamp-2 mb-2 leading-relaxed">{entity.values.title}</h4>
                                                <div className="flex items-center justify-between mt-3 text-[10px] text-surface-500">
                                                    <span className="font-mono bg-surface-800/60 px-1 py-0.5 rounded">{entity.id.substring(0, 4)}</span>
                                                    {entity.values.author_email && (
                                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary ring-1 ring-primary/30">
                                                            {entity.values.author_email.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Side panel overlay (drawer from right) ── */}
            {panelOpen && (
                <>
                    {/* Dimmed background overlay */}
                    <div
                        className="absolute inset-0 bg-black/50 z-10 transition-opacity"
                        onClick={closePanel}
                    />
                    {/* Drawer panel */}
                    <div className="absolute top-0 right-0 h-full w-[55%] max-w-[560px] min-w-[380px] z-20 bg-surface-950 border-l border-surface-800/40 flex flex-col shadow-2xl">
                        {/* Panel header — matches real: X, expand, settings + entity type badge */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-800/40 bg-surface-900/30 shrink-0">
                            <div className="flex items-center gap-2">
                                <button onClick={closePanel} className="p-1 rounded hover:bg-surface-800/60 text-surface-400 hover:text-white transition-colors" title="Close">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                                <button className="p-1 rounded hover:bg-surface-800/60 text-surface-400 hover:text-white transition-colors" title="Expand">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                                </button>
                                <button className="p-1 rounded hover:bg-surface-800/60 text-surface-400 hover:text-white transition-colors" title="Settings">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Code view toggle */}
                                <button className="p-1.5 rounded text-surface-500 hover:text-surface-300 hover:bg-surface-800/60 transition-colors" title="View code">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                                </button>
                                <span className="text-xs px-2.5 py-1 rounded-md bg-surface-800/60 text-surface-300 font-medium">Post</span>
                            </div>
                        </div>

                        {/* Entity title display — large, like the real product */}
                        <div className="px-6 pt-6 pb-2 shrink-0">
                            <div className="flex items-start justify-between">
                                <h2 className="text-xl font-semibold text-white leading-tight">
                                    {formValues.title || "Untitled"}
                                </h2>
                                <button className="p-1 rounded hover:bg-surface-700/40 text-surface-500 hover:text-white transition-colors shrink-0 ml-2" title="Mark as valid">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                </button>
                            </div>
                            <div className="mt-1.5 text-[11px] font-mono text-surface-500 bg-surface-900/60 rounded px-2 py-1 inline-block">
                                posts/{selectedEntityId}
                            </div>
                        </div>

                        {/* Form body — with field-type icons like the real product */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                            {ENTITY_FIELDS.map(field => (
                                <div key={field.key} className="rounded-lg p-3 hover:bg-surface-900/40 transition-colors">
                                    <label className="flex items-center gap-2 text-xs text-surface-400 mb-2">
                                        <FieldIcon d={field.icon} className="text-surface-500" />
                                        <span className="font-medium">{field.label}</span>
                                        {field.required && <span className="text-red-400 text-[10px]">*</span>}
                                    </label>

                                    {(field.type === "text" || field.type === "email" || field.type === "url") ? (
                                        <input
                                            type={field.type}
                                            className="w-full px-3 py-2.5 rounded-lg bg-surface-900/80 border border-surface-700/30 text-sm text-surface-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                            value={formValues[field.key] ?? ""}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        />
                                    ) : field.type === "textarea" ? (
                                        <textarea
                                            className="w-full px-3 py-2.5 rounded-lg bg-surface-900/80 border border-surface-700/30 text-sm text-surface-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                                            rows={3}
                                            value={formValues[field.key] ?? ""}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        />
                                    ) : field.type === "number" ? (
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 rounded-lg bg-surface-900/80 border border-surface-700/30 text-sm text-surface-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                                            value={formValues[field.key] ?? 0}
                                            onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
                                        />
                                    ) : field.type === "boolean" ? (
                                        <div
                                            className="flex items-center gap-3 cursor-pointer py-1"
                                            onClick={() => handleFieldChange(field.key, !formValues[field.key])}
                                        >
                                            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                                                formValues[field.key] ? "bg-primary" : "bg-surface-700"
                                            }`}>
                                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                                    formValues[field.key] ? "translate-x-4" : "translate-x-0"
                                                }`} />
                                            </div>
                                            <span className="text-sm text-surface-300">{formValues[field.key] ? "Yes" : "No"}</span>
                                        </div>
                                    ) : field.type === "select" ? (
                                        <div className="relative">
                                            <select
                                                className="w-full px-3 py-2.5 rounded-lg bg-surface-900/80 border border-surface-700/30 text-sm text-surface-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all appearance-none pr-8"
                                                value={formValues[field.key] ?? ""}
                                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                            >
                                                {field.options?.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <svg className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                                        </div>
                                    ) : field.type === "date" ? (
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2.5 rounded-lg bg-surface-900/80 border border-surface-700/30 text-sm text-surface-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                            value={formValues[field.key] ?? ""}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        />
                                    ) : null}

                                    {field.description && (
                                        <p className="text-[10px] text-surface-600 mt-1.5 ml-6">{field.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Sticky bottom action bar — matches real product */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-800/40 bg-surface-900/60 shrink-0">
                            <div className="flex items-center gap-1">
                                {/* Copy / Delete small icons */}
                                <button className="p-1.5 rounded text-surface-500 hover:text-surface-300 hover:bg-surface-800/60 transition-colors" title="Copy">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                </button>
                                <button className="p-1.5 rounded text-surface-500 hover:text-red-400 hover:bg-surface-800/60 transition-colors" title="Delete">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-semibold hover:bg-purple-500/30 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                    AUTOFILL
                                </button>
                                <button
                                    onClick={() => { setFormDirty(false); }}
                                    className="px-3 py-1.5 rounded-md text-surface-400 text-[11px] font-semibold hover:text-surface-200 hover:bg-surface-800/60 transition-colors"
                                >
                                    DISCARD
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!formDirty || isSaving}
                                    className="px-3 py-1.5 rounded-md text-surface-300 text-[11px] font-semibold hover:text-white hover:bg-surface-800/60 disabled:opacity-30 transition-colors"
                                >
                                    {isSaving ? "SAVING..." : "SAVE"}
                                </button>
                                <button
                                    onClick={() => { handleSave(); setTimeout(closePanel, 900); }}
                                    className="px-3 py-1.5 rounded-md bg-primary text-white text-[11px] font-semibold hover:bg-primary/80 transition-colors"
                                >
                                    SAVE AND CLOSE
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
