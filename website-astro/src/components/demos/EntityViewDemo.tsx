import React, { useState, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────
interface EntityField {
    key: string;
    label: string;
    type: "text" | "number" | "boolean" | "select" | "date" | "textarea" | "email" | "url";
    value: any;
    options?: { value: string; label: string }[];
    required?: boolean;
    description?: string;
    iconName: string; // Material Symbols icon name
}

interface Entity {
    id: string;
    values: Record<string, any>;
}

// ─── Mock Data ───────────────────────────────────────────
const ENTITY_FIELDS: EntityField[] = [
    { key: "title", label: "Title", type: "text", iconName: "notes", value: "Getting Started with Rebase", required: true, description: "The main display title of the post" },
    { key: "slug", label: "Slug", type: "text", iconName: "notes", value: "getting-started-with-rebase", description: "URL-friendly identifier" },
    { key: "status", label: "Status", type: "select", iconName: "unfold_more", value: "published", options: [
        { value: "draft", label: "Draft" },
        { value: "review", label: "In Review" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
    ]},
    { key: "author_email", label: "Author Email", type: "email", iconName: "mail", value: "alice@example.com" },
    { key: "category", label: "Category", type: "select", iconName: "unfold_more", value: "tutorial", options: [
        { value: "tutorial", label: "Tutorial" },
        { value: "guide", label: "Guide" },
        { value: "announcement", label: "Announcement" },
        { value: "changelog", label: "Changelog" },
    ]},
    { key: "featured", label: "Featured", type: "boolean", iconName: "check_circle", value: true },
    { key: "view_count", label: "View Count", type: "number", iconName: "tag", value: 1542 },
    { key: "published_at", label: "Published At", type: "date", iconName: "calendar_today", value: "2025-03-15" },
    { key: "excerpt", label: "Excerpt", type: "textarea", iconName: "notes", value: "Learn how to set up your first Rebase admin panel in under 5 minutes. Connect your existing Postgres database and get a complete admin UI automatically.", description: "Short summary shown in lists" },
    { key: "external_url", label: "External URL", type: "url", iconName: "link", value: "https://rebase.pro/docs/quickstart" },
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
    draft: "bg-surface-700/50 text-surface-300",
    review: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    published: "bg-green-500/10 text-green-400 border border-green-500/20",
    archived: "bg-red-500/10 text-red-400 border border-red-500/20",
};

// ─── Icon helper (Material Symbols) ─────────────────────
function MIcon({ name, className = "", size = 16 }: { name: string; className?: string; size?: number }) {
    return (
        <span className={`material-symbols-rounded ${className}`} style={{ fontSize: size }}>
            {name}
        </span>
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
                await new Promise(r => { timer = setTimeout(r, 1500); });
                if (!isMounted) return;
                setHoveredRow("1410");

                await new Promise(r => { timer = setTimeout(r, 500); });
                if (!isMounted) return;
                openEntity("1410");

                await new Promise(r => { timer = setTimeout(r, 1500); });
                if (!isMounted) return;
                handleFieldChange("status", "review");

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

                await new Promise(r => { timer = setTimeout(r, 1000); });
                if (!isMounted) return;
                setActiveView("board");

                await new Promise(r => { timer = setTimeout(r, 4000); });
                if (!isMounted) return;

                setActiveView("list");
                await new Promise(r => { timer = setTimeout(r, 1000); });
                if (!isMounted) return;

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
        <div className="relative h-[600px] w-full overflow-hidden bg-surface-900 text-surface-300 text-sm pointer-events-none select-none">
            {/* ── Full-width Table ── */}
            <div className="flex flex-col h-full">
                {/* ─────── Collection toolbar — matches prod CollectionTableToolbar ─────── */}
                <div className="min-h-[52px] overflow-x-auto px-2 md:px-4 bg-surface-900 border-b border-surface-700/40 flex flex-row justify-between items-center w-full shrink-0">
                    {/* Left side: ViewMode toggle + Filters */}
                    <div className="flex items-center gap-1 mr-4">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs mr-3">
                            <MIcon name="home" className="text-surface-400" size={16}/>
                            <span className="text-surface-600">/</span>
                            <span className="text-white font-semibold">Posts</span>
                        </div>

                        {/* View mode toggle button — matches prod ViewModeToggle popover trigger */}
                        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-surface-300 hover:bg-surface-800/60 border border-surface-700/40 transition-colors">
                            <MIcon name={activeView === "list" ? "view_list" : "view_kanban"} className="text-surface-300" size={16}/>
                            <span className="font-medium text-xs uppercase tracking-wide">{activeView === "list" ? "List" : "Board"}</span>
                        </button>

                        {/* Separator */}
                        <div className="w-px h-5 bg-surface-700/50 mx-1"></div>

                        {/* Filters button — matches prod */}
                        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-surface-400 text-xs font-medium hover:bg-surface-800/60 transition-colors">
                            <MIcon name="filter_list" className="text-surface-400" size={16}/>
                            Filters
                        </button>
                    </div>

                    {/* Right side: search, export, add */}
                    <div className="flex items-center gap-1">
                        {/* Loading indicator placeholder */}
                        <div className="w-[22px] mr-4"></div>

                        {/* Search bar — collapsed like prod */}
                        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-surface-500 text-xs hover:bg-surface-800/60 transition-colors">
                            <MIcon name="search" className="text-surface-500" size={16}/>
                        </button>

                        {/* Export */}
                        <button className="p-1.5 rounded text-surface-500 hover:text-surface-300 transition-colors">
                            <MIcon name="upload" className="opacity-70" size={16}/>
                        </button>

                        {/* Add entity button — matches prod */}
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/80 transition-colors ml-1">
                            <MIcon name="add" size={14}/>
                            Add Post
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                {activeView === "list" && (
                    <>
                        {/* ─────── Table header — matches prod VirtualTable ─────── */}
                        <div className="flex items-center border-b border-surface-700/40 bg-surface-900 text-[10px] uppercase font-bold tracking-widest text-surface-500 shrink-0 select-none">
                            {/* Row actions col */}
                            <div className="w-[100px] shrink-0 flex items-center px-3 py-3 gap-1">
                                <span>ID</span>
                                <MIcon name="search" className="text-surface-500 opacity-50" size={12}/>
                            </div>
                            <div className="w-[72px] shrink-0 flex items-center justify-center px-2 py-3">
                                <span># ID</span>
                            </div>
                            {/* Title */}
                            <div className="flex-1 min-w-[200px] flex items-center px-3 py-3 gap-2">
                                <MIcon name="notes" className="opacity-50" size={14}/>
                                <span>TITLE</span>
                                <MIcon name="filter_list" className="ml-auto opacity-40" size={14}/>
                            </div>
                            {/* Status */}
                            <div className="w-[120px] shrink-0 flex items-center px-3 py-3 gap-2">
                                <MIcon name="unfold_more" className="opacity-50" size={14}/>
                                <span>STATUS</span>
                                <MIcon name="filter_list" className="ml-auto opacity-40" size={14}/>
                            </div>
                            {/* Author */}
                            <div className="w-[180px] shrink-0 flex items-center px-3 py-3 gap-2">
                                <MIcon name="mail" className="opacity-50" size={14}/>
                                <span>AUTHOR</span>
                            </div>
                            {/* Views */}
                            <div className="w-[90px] shrink-0 flex items-center px-3 py-3 gap-2">
                                <MIcon name="tag" className="opacity-50" size={14}/>
                                <span># VIEWS</span>
                            </div>
                            {/* Published */}
                            <div className="w-[130px] shrink-0 flex items-center px-3 py-3 gap-2">
                                <MIcon name="calendar_today" className="opacity-50" size={14}/>
                                <span>PUBLISHED</span>
                            </div>
                            <div className="w-[16px] shrink-0"></div>
                        </div>

                        {/* ─────── Table body ─────── */}
                        <div className="flex-1 overflow-auto">
                            {MOCK_ENTITIES.map(entity => (
                                <div
                                    key={entity.id}
                                    onClick={() => openEntity(entity.id)}
                                    onMouseEnter={() => setHoveredRow(entity.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    className={`flex items-center border-b border-surface-700/20 cursor-pointer transition-colors min-h-[56px] ${
                                        selectedEntityId === entity.id ? "bg-primary/5" : "hover:bg-surface-800/30"
                                    }`}
                                >
                                    {/* Row actions: edit, kebab */}
                                    <div className="w-[100px] shrink-0 flex items-center gap-1 px-3">
                                        <button className={`p-1 rounded transition-opacity ${hoveredRow === entity.id ? "opacity-100" : "opacity-20"} text-surface-400`}>
                                            <MIcon name="edit_square" size={16}/>
                                        </button>
                                        <button className={`p-1 rounded transition-opacity ${hoveredRow === entity.id ? "opacity-100" : "opacity-20"} text-surface-500`}>
                                            <MIcon name="more_vert" size={16}/>
                                        </button>
                                    </div>
                                    {/* Numeric ID */}
                                    <div className="w-[72px] shrink-0 px-2 text-xs text-surface-500 font-mono text-center">
                                        {entity.id}
                                    </div>
                                    {/* Title */}
                                    <div className="flex-1 min-w-[200px] px-3 py-2.5 text-[13px] text-white font-medium truncate">
                                        {entity.values.title}
                                    </div>
                                    {/* Status */}
                                    <div className="w-[120px] shrink-0 px-3 py-2.5 flex items-center">
                                        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                                            STATUS_BADGE[entity.values.status] || STATUS_BADGE.draft
                                        }`}>
                                            {entity.values.status}
                                        </span>
                                    </div>
                                    {/* Author */}
                                    <div className="w-[180px] shrink-0 px-3 py-2.5 text-[13px] text-surface-400 truncate">
                                        {entity.values.author_email}
                                    </div>
                                    {/* Views */}
                                    <div className="w-[90px] shrink-0 px-3 py-2.5 text-[13px] text-surface-400 font-mono text-right">
                                        {entity.values.view_count?.toLocaleString()}
                                    </div>
                                    {/* Published */}
                                    <div className="w-[130px] shrink-0 px-3 py-2.5 text-[13px] text-surface-400">
                                        {entity.values.published_at ?? "—"}
                                    </div>
                                    <div className="w-[16px] shrink-0" />
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
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${statusCategory === 'draft' ? "bg-surface-400" : statusCategory === 'review' ? "bg-amber-400" : "bg-green-400"}`} />
                                            <span className="font-semibold text-xs text-surface-300 uppercase tracking-widest">{statusCategory}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-800 text-surface-400">{columnEntities.length}</span>
                                        </div>
                                        <button className="text-surface-500 hover:text-white transition-colors">
                                            <MIcon name="add" size={16}/>
                                        </button>
                                    </div>
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

            {/* ── Side panel overlay (drawer from right) — matches prod EntitySidePanel ── */}
            {panelOpen && (
                <>
                    {/* Dimmed background */}
                    <div
                        className="absolute inset-0 bg-black/50 z-10 transition-opacity"
                        onClick={closePanel}
                    />
                    {/* Drawer panel — matches prod EntityEditView: bg-surface-900 + border-l */}
                    <div className="absolute top-0 right-0 h-full w-[55%] max-w-[560px] min-w-[380px] z-20 bg-surface-900 border-l border-surface-700/40 flex flex-col shadow-2xl">
                        {/* ─── Panel top bar — matches prod EntitySidePanel barActions + Tabs ─── */}
                        <div className="h-14 items-center flex overflow-hidden w-full border-b border-surface-700/40 pl-2 pr-2 pt-1 bg-surface-900 shrink-0">
                            {/* Left: Close + Expand (matches prod barActions) */}
                            <div className="flex items-center gap-0.5">
                                <button onClick={closePanel} className="p-1.5 rounded hover:bg-surface-800/60 text-surface-400 hover:text-white transition-colors">
                                    <MIcon name="close" size={18}/>
                                </button>
                                <button className="p-1.5 rounded hover:bg-surface-800/60 text-surface-400 hover:text-white transition-colors">
                                    <MIcon name="open_in_full" size={16}/>
                                </button>
                                <button className="p-1.5 rounded hover:bg-surface-800/60 text-surface-400 hover:text-white transition-colors">
                                    <MIcon name="settings" size={16}/>
                                </button>
                            </div>

                            {/* Right: Tabs — matches prod EntityEditView tabs */}
                            <div className="flex-1 flex justify-end min-w-0">
                                <div className="flex items-center">
                                    {/* JSON tab */}
                                    <button className="px-3 py-2 text-xs text-surface-500 hover:text-surface-300 transition-colors">
                                        <MIcon name="code" size={16}/>
                                    </button>
                                    {/* Main tab - active */}
                                    <button className="px-3 py-2 text-xs text-white font-medium border-b-2 border-primary transition-colors">
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ─── Form body — matches prod EntityForm layout ─── */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="relative flex flex-col w-full pt-6 pb-16 px-4 sm:px-6">
                                {/* Dirty/synced chip — top right, matches prod */}
                                <div className="flex flex-row gap-4 self-end sticky top-4 z-10">
                                    {formDirty
                                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                                            <MIcon name="edit" size={12}/> Modified
                                        </span>
                                        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-800 text-surface-300 text-[10px] font-semibold">
                                            <MIcon name="check" size={12}/>
                                        </span>
                                    }
                                </div>

                                {/* Title — h4 like prod */}
                                <div className="w-full flex flex-col items-start my-4">
                                    <h2 className="my-4 grow line-clamp-1 text-xl font-semibold text-white leading-tight">
                                        {formValues.title || "Untitled"}
                                    </h2>

                                    {/* Entity path — Alert like prod */}
                                    <div className="w-full rounded-md bg-surface-800/40 px-3 py-1.5">
                                        <code className="text-[11px] text-surface-500 select-all">
                                            posts/{selectedEntityId}
                                        </code>
                                    </div>
                                </div>

                                {/* Form fields — uses fieldBackgroundMixin style: bg-surface-800/60, rounded, no visible border */}
                                <div className="mt-8 flex flex-col gap-4">
                                    {ENTITY_FIELDS.map(field => (
                                        <div key={field.key} className="w-full">
                                            {(field.type === "text" || field.type === "email" || field.type === "url" || field.type === "date") ? (
                                                <div className="relative rounded-md bg-surface-800/60 min-h-[48px] flex flex-col justify-center">
                                                    <span className={"absolute top-1.5 left-3 text-[10px] font-medium " + (field.required ? "text-primary" : "text-surface-400")}>
                                                        {field.label} {field.required && <span className="text-red-400">*</span>}
                                                    </span>
                                                    <div className="px-3 pt-6 pb-2 text-sm text-surface-200">
                                                        {formValues[field.key] ?? (field.type === "date" ? "—" : "")}
                                                    </div>
                                                </div>
                                            ) : field.type === "textarea" ? (
                                                <div className="relative rounded-md bg-surface-800/60 min-h-[64px] flex flex-col justify-start">
                                                    <span className={"absolute top-1.5 left-3 text-[10px] font-medium " + (field.required ? "text-primary" : "text-surface-400")}>
                                                        {field.label} {field.required && <span className="text-red-400">*</span>}
                                                    </span>
                                                    <div className="px-3 pt-6 pb-2 text-sm text-surface-200 leading-relaxed">
                                                        {formValues[field.key] ?? ""}
                                                    </div>
                                                </div>
                                            ) : field.type === "number" ? (
                                                <div className="relative rounded-md bg-surface-800/60 min-h-[48px] flex flex-col justify-center">
                                                    <span className={"absolute top-1.5 left-3 text-[10px] font-medium " + (field.required ? "text-primary" : "text-surface-400")}>
                                                        {field.label} {field.required && <span className="text-red-400">*</span>}
                                                    </span>
                                                    <div className="px-3 pt-6 pb-2 text-sm text-surface-200 font-mono">
                                                        {formValues[field.key] ?? 0}
                                                    </div>
                                                </div>
                                            ) : field.type === "boolean" ? (
                                                <div className="rounded-md bg-surface-800/60 min-h-[48px] px-4 flex items-center justify-between cursor-pointer">
                                                    <span className="text-sm text-surface-200">{field.label}</span>
                                                    <div className={"w-9 h-5 rounded-full relative flex-shrink-0 transition-colors " + (formValues[field.key] ? 'bg-primary' : 'bg-surface-600')}>
                                                        <div className={"absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform " + (formValues[field.key] ? 'right-[2px]' : 'left-[2px]')} />
                                                    </div>
                                                </div>
                                            ) : field.type === "select" ? (
                                                <div className="relative rounded-md bg-surface-800/60 min-h-[48px] flex flex-col justify-center">
                                                    <span className={"absolute top-1.5 left-3 text-[10px] font-medium " + (field.required ? "text-primary" : "text-surface-400")}>
                                                        {field.label} {field.required && <span className="text-red-400">*</span>}
                                                    </span>
                                                    <div className="px-3 pt-6 pb-2 flex items-center justify-between text-sm">
                                                        {formValues[field.key] === "published" ? (
                                                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm leading-none flex items-center h-auto">Published</span>
                                                        ) : formValues[field.key] === "review" ? (
                                                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm leading-none flex items-center h-auto">In Review</span>
                                                        ) : formValues[field.key] === "draft" ? (
                                                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-surface-700/50 text-surface-300 shadow-sm leading-none flex items-center h-auto">Draft</span>
                                                        ) : formValues[field.key] === "archived" ? (
                                                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm leading-none flex items-center h-auto">Archived</span>
                                                        ) : (
                                                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-blue-950 text-blue-300 shadow-sm leading-none flex items-center h-auto">{field.options?.find(o => o.value === formValues[field.key])?.label ?? formValues[field.key]}</span>
                                                        )}
                                                        <MIcon name="expand_more" className="text-surface-500" size={18}/>
                                                    </div>
                                                </div>
                                            ) : null}

                                            {field.description && (
                                                <p className="text-[10px] text-surface-500 mt-1 ml-1">{field.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ─── Sticky bottom action bar — matches prod EntityEditViewFormActions ─── */}
                        <div className="flex items-center justify-between px-3 py-2.5 border-t border-surface-700/40 bg-surface-900 shrink-0">
                            <div className="flex items-center gap-1">
                                <button className="p-1.5 rounded text-surface-500 hover:text-surface-300 hover:bg-surface-800/60 transition-colors">
                                    <MIcon name="content_copy" size={16}/>
                                </button>
                                <button className="p-1.5 rounded text-surface-500 hover:text-red-400 hover:bg-surface-800/60 transition-colors">
                                    <MIcon name="delete" size={16}/>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 rounded-md text-surface-400 text-[11px] font-semibold hover:text-surface-200 hover:bg-surface-800/60 transition-colors">
                                    DISCARD
                                </button>
                                <button
                                    disabled={!formDirty || isSaving}
                                    className="px-3 py-1.5 rounded-md text-surface-300 text-[11px] font-semibold hover:text-white hover:bg-surface-800/60 disabled:opacity-30 transition-colors"
                                >
                                    {isSaving ? "SAVING..." : "SAVE"}
                                </button>
                                <button className="px-3 py-1.5 rounded-md bg-primary text-white text-[11px] font-semibold hover:bg-primary/80 transition-colors">
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
