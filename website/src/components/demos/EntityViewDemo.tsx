import React, { useState, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────
interface Entity {
  id: number;
  title: string;
  image: string | null;
  status: "Published" | "In Review" | "Draft" | "Archived";
  author: { name: string; email: string } | null;
  tags: string[];
}

// ─── Mock Data ───────────────────────────────────────────
const MOCK_ENTITIES: Entity[] = [
  {
    id: 43,
    title: "Captivating Caption for Your Latest Post",
    image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=240&h=160&fit=crop",
    status: "Published",
    author: { name: "Emily Watson", email: "emily.w@example.com" },
    tags: ["Travel", "Music", "Business", "Sports", "Gaming"],
  },
  {
    id: 42,
    title: "Visually Appealing Image Design!",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=240&h=160&fit=crop",
    status: "Published",
    author: { name: "Steve Rogers", email: "steve.r@example.com" },
    tags: ["DIY", "Fashion"],
  },
  {
    id: 41,
    title: "The Importance of Mental Health",
    image: null,
    status: "In Review",
    author: { name: "Alice Johnson", email: "alice.j@example.com" },
    tags: ["Movies", "Books"],
  },
  {
    id: 40,
    title: "A Look at Sustainable Farming Practices",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=240&h=160&fit=crop",
    status: "Draft",
    author: { name: "George Costanza", email: "george.c@example.com" },
    tags: [],
  },
  {
    id: 39,
    title: "The Psychology of Color in Marketing",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=240&h=160&fit=crop",
    status: "Published",
    author: { name: "Rachel Green", email: "rachel.g@example.com" },
    tags: ["Music", "Movies", "Art"],
  },
  {
    id: 38,
    title: "DIY Home Renovation Tips",
    image: null,
    status: "Draft",
    author: { name: "Pam Beesly", email: "pam.b@example.com" },
    tags: ["Lifestyle", "DIY"],
  },
  {
    id: 37,
    title: "Mastering the Art of Negotiation",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=240&h=160&fit=crop",
    status: "Published",
    author: { name: "Laura Palmer", email: "laura.p@example.com" },
    tags: [],
  },
  {
    id: 36,
    title: "Modern Architectural Marvels",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=240&h=160&fit=crop",
    status: "Draft",
    author: { name: "George Costanza", email: "george.c@example.com" },
    tags: [],
  },
  {
    id: 35,
    title: "Exploring the Deep Sea",
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=240&h=160&fit=crop",
    status: "Archived",
    author: { name: "Hannah Abbott", email: "hannah.a@example.com" },
    tags: ["Science"],
  },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Published: { bg: "rgb(147, 224, 136)", text: "rgb(11, 29, 5)" },
  "In Review": { bg: "rgb(255, 169, 129)", text: "rgb(107, 38, 19)" },
  Draft: { bg: "rgb(204, 204, 204)", text: "rgb(4, 4, 4)" },
  Archived: { bg: "rgb(255, 158, 183)", text: "rgb(76, 12, 28)" },
};

// ─── Kanban Data (for TAGS collection) ───────────────────
// Matches production EntityBoardCard: thumbnail + title + ID
interface KanbanCard {
  id: string;
  title: string;
  image?: string | null;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "rgb(156, 163, 175)",
    cards: [
      { id: "871492", title: "Dark mode", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=80&h=80&fit=crop" },
      { id: "871388", title: "Search indexing", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=80&h=80&fit=crop" },
      { id: "871204", title: "API documentation", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop" },
    ],
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "rgb(251, 191, 36)",
    cards: [
      { id: "871090", title: "Auth middleware refactor", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=80&h=80&fit=crop" },
      { id: "870984", title: "Onboarding flow", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=80&h=80&fit=crop" },
    ],
  },
  {
    id: "review",
    title: "Review",
    color: "rgb(96, 165, 250)",
    cards: [
      { id: "870812", title: "RLS policies", image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=80&h=80&fit=crop" },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "rgb(74, 222, 128)",
    cards: [
      { id: "870650", title: "CI/CD pipeline", image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=80&h=80&fit=crop" },
      { id: "870511", title: "Export to CSV", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop" },
    ],
  },
];

/* ─── Material icon helper ─── */
function MI({
  children,
  size = 20,
  className = "",
  filled = true,
}: {
  children: string;
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      className={`material-symbols-rounded select-none ${className}`}
      style={{ fontSize: size, lineHeight: 1, ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}) }}
    >
      {children}
    </span>
  );
}

/* ─── Column Header ─── */
function ColHeader({
  icon,
  label,
  width,
  showFilter = true,
  align = "left",
}: {
  icon?: string;
  label: string;
  width: number;
  showFilter?: boolean;
  align?: "left" | "right" | "center";
}) {
  return (
    <div
      className="flex-shrink-0 h-full"
      style={{ minWidth: width, maxWidth: width, width }}
    >
      <div
        className="flex py-0 px-3 h-full text-xs uppercase font-semibold select-none items-center bg-surface-50 dark:bg-surface-900 text-text-secondary dark:text-surface-400 relative"
        style={{ minWidth: width, maxWidth: width }}
      >
        <div className="overflow-hidden grow">
          <div
            className="flex items-center flex-row gap-1"
            style={{ justifyContent: align }}
          >
            {icon && (
              <MI size={18} className="opacity-60">
                {icon}
              </MI>
            )}
            <div className="truncate mx-0.5">{label}</div>
          </div>
        </div>
        {showFilter && (
          <div className="relative inline-block">
            <button className="p-1 rounded-full text-surface-400 hover:bg-surface-200/50 dark:hover:bg-surface-800/50">
              <MI size={18}>filter_list</MI>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Entity Row ─── */
function EntityRow({
  entity,
  isHovered,
  isSelected,
  highlightedField,
  onHover,
  onLeave,
  onClick,
}: {
  entity: Entity;
  isHovered: boolean;
  isSelected: boolean;
  highlightedField?: string | null;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const statusColor = STATUS_COLORS[entity.status] || STATUS_COLORS.Draft;

  return (
    <div
      className={`flex min-w-full text-sm border-b border-surface-200/20 dark:border-surface-700/30 cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : isHovered ? "bg-surface-100/50 dark:bg-surface-800/20" : ""}`}
      style={{ height: 54 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Row Actions — always visible (production: EntityCollectionRowActions) */}
      <div
        className="flex-shrink-0 h-full sticky left-0 z-10"
        style={{ minWidth: 138, maxWidth: 138, width: 138 }}
      >
        <div className="h-full flex items-center justify-center flex-col bg-surface-50/90 dark:bg-surface-900/90">
          <div className="w-34 flex justify-center gap-0.5">
            <button className="p-1 rounded-full text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
              <MI size={18}>edit</MI>
            </button>
            <button className="p-1 rounded-full text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
              <MI size={20}>more_vert</MI>
            </button>
            <div className="p-1">
              <div className="border-2 w-4 h-4 rounded flex items-center justify-center bg-white dark:bg-surface-900 border-surface-400 dark:border-surface-500" />
            </div>
          </div>
          <div className="w-[138px] overflow-hidden truncate font-mono text-xs text-text-secondary dark:text-text-secondary-dark px-2 text-center">
            {entity.id}
          </div>
        </div>
      </div>

      {/* Title */}
      <div
        className="flex-shrink-0 flex items-center px-2"
        style={{ minWidth: 280, maxWidth: 280, width: 280 }}
      >
        <div className="truncate text-sm text-surface-900 dark:text-white">
          {entity.title}
        </div>
      </div>

      {/* Image */}
      <div
        className="flex-shrink-0 flex items-center justify-center px-2"
        style={{ minWidth: 120, maxWidth: 120, width: 120 }}
      >
        {entity.image ? (
          <img
            src={entity.image}
            alt=""
            className="w-[90px] h-[40px] object-cover rounded-md"
            loading="lazy"
          />
        ) : (
          <div className="w-[90px] h-[40px] rounded-md bg-surface-200/40 dark:bg-surface-800/60 flex items-center justify-center">
            <MI size={18} className="text-surface-400">image</MI>
          </div>
        )}
      </div>

      {/* Status */}
      <div
        className={`flex-shrink-0 flex items-center px-2 transition-all duration-300 ${highlightedField === "status" ? "ring-2 ring-green-500 rounded-md" : ""}`}
        style={{ minWidth: 140, maxWidth: 140, width: 140 }}
      >
        <span
          className="rounded-lg inline-flex items-center px-2.5 py-0.5 text-xs font-normal whitespace-nowrap"
          style={{
            backgroundColor: statusColor.bg,
            color: statusColor.text,
          }}
        >
          {entity.status}
        </span>
      </div>

      {/* Author (relation cell) */}
      <div
        className="flex-shrink-0 flex items-center px-2"
        style={{ minWidth: 200, maxWidth: 200, width: 200 }}
      >
        {entity.author ? (
          <div className="min-h-[38px] py-1 px-2 w-full rounded-md text-sm flex items-center bg-surface-200/20 dark:bg-surface-800/30">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-primary">
                <MI size={20}>person</MI>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-surface-900 dark:text-white">
                  {entity.author.name}
                </div>
                <div className="truncate text-xs text-surface-500">
                  {entity.author.email}
                </div>
              </div>
            </div>
            <MI size={16} className="text-surface-400 flex-shrink-0">
              keyboard_arrow_down
            </MI>
          </div>
        ) : (
          <div className="min-h-[38px] py-1 px-2 w-full rounded-md text-sm flex items-center bg-surface-200/20 dark:bg-surface-800/30 justify-between">
            <span className="text-surface-400">—</span>
            <MI size={16} className="text-surface-400">
              keyboard_arrow_down
            </MI>
          </div>
        )}
      </div>

      {/* Tags (relation chips) */}
      <div
        className="flex-shrink-0 flex items-center px-2 overflow-hidden"
        style={{ minWidth: 240, maxWidth: 240, width: 240 }}
      >
        {entity.tags.length > 0 ? (
          <div className="min-h-[38px] py-1 px-2 w-full rounded-md text-sm flex items-center bg-surface-200/20 dark:bg-surface-800/30">
            <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0 overflow-hidden max-h-[38px]">
              {entity.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 whitespace-nowrap"
                >
                  <MI size={12} className="text-primary opacity-70">
                    tag
                  </MI>
                  {tag}
                </span>
              ))}
              {entity.tags.length > 3 && (
                <span className="text-xs text-surface-400">
                  +{entity.tags.length - 3}
                </span>
              )}
            </div>
            <MI size={16} className="text-surface-400 flex-shrink-0">
              keyboard_arrow_down
            </MI>
          </div>
        ) : (
          <div className="min-h-[38px] py-1 px-2 w-full rounded-md text-sm flex items-center bg-surface-200/20 dark:bg-surface-800/30 justify-between">
            <span className="text-surface-400">—</span>
            <MI size={16} className="text-surface-400">
              keyboard_arrow_down
            </MI>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   Exact Scaffold.tsx + DefaultDrawer.tsx + DefaultAppBar.tsx
   layout from production
   ═══════════════════════════════════════════════════════════ */
export function EntityViewDemo() {
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  // Inline table cell overrides (spreadsheet-style editing)
  const [tableOverrides, setTableOverrides] = useState<Record<number, Partial<Entity>>>({});
  // Green border highlight: { entityId, field }
  const [highlightedCell, setHighlightedCell] = useState<{ entityId: number; field: string } | null>(null);
  // Also highlight form fields
  const [highlightedFormField, setHighlightedFormField] = useState<string | null>(null);
  // Active collection (for switching between list/kanban)
  const [activeCollection, setActiveCollection] = useState<"posts" | "tags">("posts");
  // Kanban drag animation state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [kanbanHighlight, setKanbanHighlight] = useState<string | null>(null);
  // Which column the dragged card is hovering over (for spacer)
  const [dropTargetColumn, setDropTargetColumn] = useState<string | null>(null);
  // Source column of the dragged card (to compute overlay position)
  const [dragSourceColumn, setDragSourceColumn] = useState<string | null>(null);

  const flashCell = useCallback((entityId: number, field: string, durationMs = 1000) => {
    setHighlightedCell({ entityId, field });
    setTimeout(() => setHighlightedCell(null), durationMs);
  }, []);

  const flashFormField = useCallback((field: string, durationMs = 1000) => {
    setHighlightedFormField(field);
    setTimeout(() => setHighlightedFormField(null), durationMs);
  }, []);

  const panelOpen = selectedEntityId !== null;
  const selectedEntity = MOCK_ENTITIES.find((e) => e.id === selectedEntityId);

  const openEntity = useCallback((id: number) => {
    const entity = MOCK_ENTITIES.find((e) => e.id === id);
    if (entity) {
      setSelectedEntityId(id);
      setFormValues({
        title: entity.title,
        image: entity.image,
        status: entity.status,
        author: entity.author,
        tags: entity.tags,
      });
      setFormDirty(false);
    }
  }, []);

  const closePanel = useCallback(() => {
    setSelectedEntityId(null);
    setFormDirty(false);
  }, []);

  // Animation loop — never static for more than ~800ms
  useEffect(() => {
    let isMounted = true;
    let timer: any = null;
    const wait = (ms: number) =>
      new Promise<void>((r) => {
        timer = setTimeout(r, ms);
      });
    const guard = () => isMounted;

    const animateKanbanDrag = async (targetX: number, targetY: number, steps = 30) => {
      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        // Ease-out curve
        const ease = 1 - Math.pow(1 - progress, 3);
        const x = ease * targetX;
        const y = ease * targetY + Math.sin(progress * Math.PI) * -8;
        setDragOffset({ x, y });
        await new Promise(r => { timer = setTimeout(r, 16); });
        if (!isMounted) return;
      }
    };

    const loop = async () => {
      while (isMounted) {
        // ── Phase 1: Browse rows, then inline-edit status in table ──
        setActiveCollection("posts");
        setHoveredRow(43);
        await wait(350); if (!guard()) return;
        setHoveredRow(42);
        await wait(300); if (!guard()) return;
        setHoveredRow(40);
        await wait(300); if (!guard()) return;

        // Inline edit: change entity 40 status from Draft → In Review directly in table
        setTableOverrides((prev) => ({ ...prev, 40: { status: "In Review" } }));
        flashCell(40, "status");
        await wait(700); if (!guard()) return;

        // Move on
        setHoveredRow(39);
        await wait(300); if (!guard()) return;
        setHoveredRow(42);
        await wait(300); if (!guard()) return;

        // ── Phase 2: Open entity 42 ──
        openEntity(42);
        setHoveredRow(null);
        await wait(700); if (!guard()) return;

        // Change status in form
        setFormValues((prev) => ({ ...prev, status: "In Review" }));
        setFormDirty(true);
        flashFormField("status");
        await wait(500); if (!guard()) return;

        // Save
        setIsSaving(true);
        await wait(450); if (!guard()) return;
        setIsSaving(false);
        setFormDirty(false);
        await wait(350); if (!guard()) return;

        // Close
        closePanel();
        await wait(400); if (!guard()) return;

        // ── Phase 3: Hover to entity 39, open it ──
        setHoveredRow(42);
        await wait(200); if (!guard()) return;
        setHoveredRow(40);
        await wait(200); if (!guard()) return;
        setHoveredRow(39);
        await wait(300); if (!guard()) return;

        openEntity(39);
        setHoveredRow(null);
        await wait(600); if (!guard()) return;

        // Browse briefly
        await wait(400); if (!guard()) return;

        // Close
        closePanel();
        await wait(350); if (!guard()) return;

        // ── Phase 4: Switch to TAGS collection → Kanban mode ──
        setHoveredRow(null);
        setTableOverrides({});
        setActiveCollection("tags");
        await wait(800); if (!guard()) return;

        // Hover over cards briefly
        setKanbanHighlight("871090");
        await wait(500); if (!guard()) return;
        setKanbanHighlight("870984");
        await wait(400); if (!guard()) return;
        setKanbanHighlight(null);
        await wait(300); if (!guard()) return;

        // Drag card from "In Progress" to "Review" column
        setDragSourceColumn("in_progress");
        setDraggedCardId("870984");
        setDragOffset({ x: 0, y: 0 });
        await wait(200); if (!guard()) return;
        setDropTargetColumn("review");
        await animateKanbanDrag(260, -60);
        if (!guard()) return;
        await wait(300); if (!guard()) return;
        setDraggedCardId(null);
        setDragOffset({ x: 0, y: 0 });
        setDropTargetColumn(null);
        setDragSourceColumn(null);
        await wait(600); if (!guard()) return;

        // Highlight another card
        setKanbanHighlight("871492");
        await wait(500); if (!guard()) return;
        setKanbanHighlight("871388");
        await wait(400); if (!guard()) return;
        setKanbanHighlight(null);
        await wait(300); if (!guard()) return;

        // Drag card from "Backlog" to "In Progress"
        setDragSourceColumn("backlog");
        setDraggedCardId("871388");
        setDragOffset({ x: 0, y: 0 });
        await wait(200); if (!guard()) return;
        setDropTargetColumn("in_progress");
        await animateKanbanDrag(240, -30);
        if (!guard()) return;
        await wait(300); if (!guard()) return;
        setDraggedCardId(null);
        setDragOffset({ x: 0, y: 0 });
        setDropTargetColumn(null);
        setDragSourceColumn(null);
        await wait(800); if (!guard()) return;

        // ── Phase 5: Switch back to POSTS ──
        setActiveCollection("posts");
        await wait(400); if (!guard()) return;

        // Quick browse
        setHoveredRow(43);
        await wait(200); if (!guard()) return;
        setHoveredRow(42);
        await wait(200); if (!guard()) return;
        setHoveredRow(40);
        await wait(200); if (!guard()) return;
        setHoveredRow(43);
        await wait(350); if (!guard()) return;

        // Inline table edit: change 43 Published → Draft
        setTableOverrides((prev) => ({ ...prev, 43: { status: "Draft" } }));
        flashCell(43, "status");
        await wait(600); if (!guard()) return;

        // Open entity 43 to see the change
        openEntity(43);
        setHoveredRow(null);
        await wait(500); if (!guard()) return;

        // Revert status in form
        setFormValues((prev) => ({ ...prev, status: "Published" }));
        setFormDirty(true);
        flashFormField("status");
        await wait(400); if (!guard()) return;

        // Save
        setIsSaving(true);
        await wait(450); if (!guard()) return;
        setIsSaving(false);
        setFormDirty(false);
        setTableOverrides((prev) => ({ ...prev, 43: { status: "Published" } }));
        await wait(350); if (!guard()) return;

        // Close
        closePanel();
        await wait(400); if (!guard()) return;

        // Reset
        setHoveredRow(null);
        setTableOverrides({});
        await wait(300); if (!guard()) return;
      }
    };

    loop();
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [openEntity, closePanel]);

  /* ── Drawer nav items (production-identical: DrawerNavigationItem.tsx) ── */
  const NAV_ITEMS = [
    { icon: "folder", label: "POSTS", key: "posts" as const, active: activeCollection === "posts" },
    { icon: "person", label: "AUTHORS", key: "authors" as const, active: false },
    { icon: "sell", label: "TAGS", key: "tags" as const, active: activeCollection === "tags" },
  ];

  return (
    /* ── Scaffold root: exact Scaffold.tsx line 106 ── */
    <div
      className="flex overflow-hidden bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white pointer-events-none select-none relative"
      style={{ height: 600, width: "100%" }}
    >
      {/* ═══ AppBar — exact DefaultAppBar.tsx: absolute top-0, h-16, pl-24 ═══ */}
      <div
        className="w-full h-16 transition-all ease-in duration-75 absolute top-0 max-w-full overflow-x-auto no-scrollbar flex flex-row gap-2 px-4 items-center pl-24 z-10"
      >
        {/* Breadcrumbs — exact DefaultAppBar.tsx line 160-198 */}
        <div className="mr-8 hidden lg:block">
          <div className="flex flex-row gap-2 items-center">
            {/* HomeIcon */}
            <div className="flex flex-row items-center justify-center -mt-0.5 opacity-80 hover:opacity-100 transition-opacity">
              <MI size={18} className="text-text-secondary dark:text-surface-400">home</MI>
            </div>
            {/* / */}
            <span className="text-xs text-text-secondary dark:text-surface-500">/</span>
            {/* Breadcrumb entry */}
            <div className="flex flex-row items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-surface-900 dark:text-surface-200">{activeCollection === "posts" ? "Posts" : "Tags"}</span>
              <span className="text-xs text-surface-accent-500 dark:text-surface-accent-400 bg-surface-100 dark:bg-surface-700 px-1 py-0 rounded">
                {activeCollection === "posts" ? "9" : "8"}
              </span>
            </div>
          </div>
        </div>

        <div className="grow" />

        {/* Content / Studio toggle — exact DefaultAppBar.tsx line 214-234 */}
        <div className="mr-2 hidden sm:flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5 border border-surface-200 dark:border-surface-700">
          <button className="px-3 py-1 text-xs font-semibold rounded-md bg-white dark:bg-surface-900 shadow-sm text-primary dark:text-primary-400">
            Content
          </button>
          <button className="px-3 py-1 text-xs font-semibold rounded-md text-surface-500 hover:text-surface-900 dark:hover:text-white">
            Studio
          </button>
        </div>

        {/* Language toggle placeholder */}
        <button className="p-2 text-surface-400 rounded-full">
          <MI size={20}>translate</MI>
        </button>

        {/* Dark mode — DarkModeIcon */}
        <button className="p-2 text-surface-400 rounded-full">
          <MI size={20}>dark_mode</MI>
        </button>

        {/* Avatar — exact DefaultAppBar.tsx Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface-200 dark:bg-surface-700 text-sm font-medium text-surface-700 dark:text-white">
          F
        </div>
      </div>

      {/* ═══ DrawerWrapper — exact Scaffold.tsx DrawerWrapper (large layout, collapsed) ═══ */}
      {/* z-20 relative, width: 72, inner has no-scrollbar overflow-y-auto border-r */}
      <div
        className="z-20 relative hidden sm:block"
        style={{
          width: 72,
          transition:
            "left 75ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, opacity 75ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, width 75ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
        }}
      >
        {/* Inner drawer — exact DrawerWrapper innerDrawer, relative mode */}
        <div
          className="h-full no-scrollbar overflow-y-auto overflow-x-hidden relative bg-surface-50 dark:bg-surface-900"
          style={{ width: 72 }}
        >
          <div className="flex flex-col h-full">
            {/* ─ DrawerLogo — exact DefaultDrawer.tsx DrawerLogo, collapsed ─ */}
            <div className="flex flex-row items-center shrink-0 pt-4 pb-0 px-2">
              {/* Logo — always visible, shrink-0 w-[56px] h-[40px] centered */}
              <div className="shrink-0 flex items-center justify-center w-[56px] h-[40px]">
                <img src="/img/rebase_logo.svg" alt="Rebase" className="w-[28px] h-[28px] object-contain" />
              </div>
              {/* Title — hidden when collapsed: opacity-0 w-0 */}
              <div className="flex flex-row items-center overflow-hidden transition-all duration-200 ease-in-out opacity-0 w-0 ml-0" />
            </div>

            {/* ─ DrawerNavigationGroup — exact DrawerNavigationGroup.tsx ─ */}
            <div className="mt-1 flex-grow overflow-scroll no-scrollbar">
              <div className="my-2 mx-2 flex flex-col">
                {/* Group header hidden when collapsed (opacity-0 invisible pointer-events-none) */}
                <div className="pl-4 pr-2 py-1 flex flex-row items-center opacity-0 invisible pointer-events-none">
                  <MI size={14} className="text-surface-500 dark:text-surface-400 mr-1">expand_more</MI>
                  <span className="text-xs text-surface-500 dark:text-surface-400 font-medium flex-grow line-clamp-1">
                    CONTENT
                  </span>
                </div>

                {/* Collapsible content with nav items — exact DrawerNavigationItem.tsx */}
                <div className="overflow-hidden bg-surface-50 dark:bg-surface-800/30 rounded-lg">
                  {NAV_ITEMS.map((item) => (
                    <div key={item.label}>
                      <div
                        className={`rounded-lg truncate flex flex-row items-center h-10 font-semibold text-xs ${
                          item.active
                            ? "bg-surface-accent-200/60 dark:bg-surface-800 dark:bg-opacity-50"
                            : "hover:bg-surface-accent-300/75 dark:hover:bg-surface-accent-800/75"
                        } text-text-primary dark:text-surface-200`}
                      >
                        {/* Icon wrap — exact DrawerNavigationItem.tsx: shrink-0 w-[56px] h-[40px] */}
                        <div className="shrink-0 flex items-center justify-center w-[56px] h-[40px] text-text-secondary dark:text-text-secondary-dark">
                          <MI size={18} filled>{item.icon}</MI>
                        </div>
                        {/* Label hidden when collapsed */}
                        <div className="text-text-primary dark:text-surface-200 opacity-0 hidden font-inherit truncate space-x-2">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─ DrawerToggle — exact DefaultDrawer.tsx DrawerToggle ─ */}
            <div className="shrink-0 mt-auto px-2 py-2">
              <div className="flex flex-row items-center rounded-lg cursor-pointer hover:bg-surface-accent-100 dark:hover:bg-surface-800 transition-colors duration-150 py-2">
                <div className="shrink-0 flex items-center justify-center w-[56px] h-[24px] text-surface-500 dark:text-surface-400">
                  <MI size={18}>keyboard_double_arrow_right</MI>
                </div>
                {/* Label hidden when collapsed */}
                <div className="overflow-hidden transition-all duration-200 ease-in-out opacity-0 w-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main — exact Scaffold.tsx line 131-148 ═══ */}
      <main className="flex flex-col grow overflow-auto">
        {/* DrawerHeader spacer — exact Scaffold.tsx line 157: min-h-16 */}
        <div className="flex flex-col min-h-16" />

        {/* Collection container — exact Scaffold.tsx line 137 */}
        <div className="border-surface-200/20 dark:border-surface-700/30 bg-surface-50 dark:bg-surface-900 grow overflow-auto m-0 mt-1 lg:m-0 lg:mx-2 lg:mb-2 lg:rounded-lg lg:border flex flex-col">
          {/* ── Collection Toolbar ── */}
          <div className="min-h-[48px] overflow-x-auto px-2 md:px-4 bg-surface-50 dark:bg-surface-900 border-b border-surface-200/40 dark:border-surface-700/40 flex flex-row justify-between items-center w-full shrink-0">
            {/* Left side */}
            <div className="flex items-center gap-1 mr-4">
              <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white">
                <MI size={18}>{activeCollection === "posts" ? "list" : "view_kanban"}</MI>
                <span className="ml-1 text-sm">{activeCollection === "posts" ? "List" : "Board"}</span>
              </button>
              <button className="p-1.5 rounded-full text-surface-500 hover:bg-surface-200/50 dark:hover:bg-surface-800">
                <MI size={18}>filter_list</MI>
              </button>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-1">
              {/* Search bar — matches production SearchBar expandable */}
              <div className="flex items-center rounded-md bg-surface-100 dark:bg-surface-800 px-2.5 py-1 gap-1.5 min-w-[160px]">
                <MI size={16} className="text-surface-400">search</MI>
                <span className="text-xs text-surface-400 whitespace-nowrap">Search</span>
              </div>
              <button className="p-1.5 rounded-full text-surface-500">
                <MI size={18}>settings</MI>
              </button>
              <button className="p-1.5 rounded-full text-surface-500 opacity-50">
                <MI size={18}>delete</MI>
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-white text-sm">
                <MI size={18}>add</MI>
              </button>
            </div>
          </div>

          {/* ── Content Area ── */}
          {activeCollection === "posts" ? (
            /* ── Table (List view for Posts) ── */
            <div className="h-full w-full flex flex-col bg-white dark:bg-surface-950 overflow-auto">
              {/* Table header */}
              <div
                className="sticky top-0 z-10 flex min-w-fit border-b border-surface-200/20 dark:border-surface-700/30 bg-surface-50 dark:bg-surface-900"
                style={{ height: 44 }}
              >
                <ColHeader label="" width={138} showFilter={false} align="center" />
                <ColHeader icon="short_text" label="Title" width={280} />
                <ColHeader icon="image" label="Image" width={120} showFilter={false} align="center" />
                <ColHeader icon="list" label="Status" width={140} />
                <ColHeader icon="add_link" label="Author" width={200} />
                <ColHeader icon="add_link" label="Tags" width={240} />
                <div className="flex items-center justify-center w-16 text-surface-400">
                  <MI size={22}>add</MI>
                </div>
              </div>

              {/* Table body */}
              <div className="flex-1">
                {MOCK_ENTITIES.map((entity) => {
                  const merged = { ...entity, ...tableOverrides[entity.id] } as Entity;
                  return (
                    <EntityRow
                      key={entity.id}
                      entity={merged}
                      isHovered={hoveredRow === entity.id}
                      isSelected={selectedEntityId === entity.id}
                      highlightedField={highlightedCell?.entityId === entity.id ? highlightedCell.field : null}
                      onHover={() => setHoveredRow(entity.id)}
                      onLeave={() => setHoveredRow(null)}
                      onClick={() => openEntity(entity.id)}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Kanban Board — matches production Board.tsx + BoardColumn.tsx + EntityBoardCard.tsx ── */
            <div className="flex-1 overflow-auto no-scrollbar relative">
              <div className="p-2 md:p-3 lg:p-4 h-full min-w-full inline-flex">
                {KANBAN_COLUMNS.map((col) => {
                  const colHasDraggedCard = col.cards.some(c => c.id === draggedCardId);

                  return (
                    <div
                      key={col.id}
                      className="border h-full w-80 min-w-80 mx-2 flex flex-col rounded-md border-surface-200 dark:border-surface-700/50"
                    >
                      {/* Column header */}
                      <div className="flex items-center justify-between px-2 rounded-t-md bg-surface-50 dark:bg-surface-950">
                        <h4 className="py-3 px-3 flex-grow select-none flex items-center gap-3 text-sm font-semibold text-surface-800 dark:text-surface-200">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: col.color }}
                          />
                          {col.title}
                        </h4>
                        <span className="text-xs text-surface-500 dark:text-surface-400 mr-1">
                          {col.cards.length}
                        </span>
                        <button className="p-1 rounded-full opacity-60 hover:opacity-100 text-surface-500 dark:text-surface-400">
                          <MI size={18}>add</MI>
                        </button>
                      </div>

                      {/* Cards list */}
                      <div className="flex-1 overflow-y-auto px-2 pb-2">
                        {col.cards.map((card) => {
                          const isDragged = draggedCardId === card.id;
                          const isHighlighted = kanbanHighlight === card.id;

                          // Don't render the card inline if it's being dragged — it's rendered as an overlay
                          if (isDragged) {
                            return (
                              <div key={card.id} className="py-1">
                                {/* Ghost placeholder */}
                                <div className="h-[56px] rounded-lg border-2 border-dashed border-surface-300/40 dark:border-surface-700/50 bg-surface-100/30 dark:bg-surface-800/10 transition-all duration-200" />
                              </div>
                            );
                          }

                          return (
                            <div key={card.id} className="py-1">
                              <div
                                className={`p-2 flex items-start border rounded-lg cursor-pointer transition-colors border-surface-200 dark:border-surface-700/50 ${
                                  isHighlighted
                                    ? "bg-white dark:bg-surface-900 ring-2 ring-primary"
                                    : "bg-white dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800"
                                }`}
                              >
                                {card.image ? (
                                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 mr-2">
                                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" loading="lazy" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-surface-100 dark:bg-surface-800 shrink-0 mr-2 flex items-center justify-center">
                                    <MI size={18} className="text-surface-400">sell</MI>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="line-clamp-2 text-sm font-medium text-surface-900 dark:text-white">{card.title}</div>
                                  <div className="text-xs text-surface-500 font-mono truncate">{card.id}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Drop target spacer — shows "make room" in target column */}
                        {dropTargetColumn === col.id && !colHasDraggedCard && (
                          <div className="py-1">
                            <div className="h-[56px] rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 transition-all duration-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drag overlay — rendered outside columns so it can float freely */}
              {draggedCardId && (() => {
                // Find the dragged card data
                let draggedCard: KanbanCard | null = null;
                let sourceColIndex = 0;
                let cardIndexInCol = 0;
                for (let ci = 0; ci < KANBAN_COLUMNS.length; ci++) {
                  const idx = KANBAN_COLUMNS[ci].cards.findIndex(c => c.id === draggedCardId);
                  if (idx !== -1) {
                    draggedCard = KANBAN_COLUMNS[ci].cards[idx];
                    sourceColIndex = ci;
                    cardIndexInCol = idx;
                    break;
                  }
                }
                if (!draggedCard) return null;

                // Calculate approximate position based on column index and card index
                // Column: p-4 (16px) + col index * (w-80=320px + mx-2*2=16px) + px-2 (8px)
                const colLeft = 16 + sourceColIndex * (320 + 16) + 8;
                // Card: header ~48px + card index * (56px card + 8px py-1*2)
                const cardTop = 48 + cardIndexInCol * 64 + 4;

                return (
                  <div
                    className="absolute z-50 w-[304px] pointer-events-none"
                    style={{
                      left: colLeft,
                      top: cardTop,
                      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(3deg)`,
                      transition: "none",
                    }}
                  >
                    <div
                      className="p-2 flex items-start border rounded-lg ring-2 ring-primary bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-700/50"
                      style={{
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        opacity: 0.95,
                      }}
                    >
                      {draggedCard.image ? (
                        <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 mr-2">
                          <img src={draggedCard.image} alt={draggedCard.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-surface-100 dark:bg-surface-800 shrink-0 mr-2 flex items-center justify-center">
                          <MI size={18} className="text-surface-400">sell</MI>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="line-clamp-2 text-sm font-medium text-surface-900 dark:text-white">{draggedCard.title}</div>
                        <div className="text-xs text-surface-500 font-mono truncate">{draggedCard.id}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>

      {/* ═══ Side Panel Overlay — always rendered, CSS transition ═══ */}
      <div
        className="absolute inset-0 z-30 transition-opacity duration-200"
        style={{
          backgroundColor: panelOpen ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
          pointerEvents: panelOpen ? 'auto' : 'none',
        }}
        onClick={closePanel}
      />
      {/* ═══ Side Panel — always rendered, slides in/out ═══ */}
      <div
        className="absolute top-0 right-0 h-full w-[55%] max-w-[680px] min-w-[340px] z-40 bg-white dark:bg-surface-900 border-l border-surface-200/20 dark:border-surface-700/30 flex flex-col shadow-2xl transition-transform duration-300 ease-out"
        style={{ transform: panelOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {selectedEntity && (
          <>
            {/* Panel top bar */}
            <div className="h-14 flex items-center px-3 border-b border-surface-200/20 dark:border-surface-700/30 shrink-0 gap-1">
              <button className="p-1.5 rounded text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                <MI size={18}>close</MI>
              </button>
              <button className="p-1.5 rounded text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                <MI size={16}>open_in_full</MI>
              </button>
              <div className="flex-1" />
              <button className="px-3 py-2 text-xs text-surface-500">
                <MI size={16}>code</MI>
              </button>
              <button className="px-3 py-2 text-xs text-surface-900 dark:text-white font-medium border-b-2 border-primary">
                Post
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col w-full pt-6 pb-16 px-4 sm:px-6">
                {/* Dirty badge */}
                <div className="flex justify-end mb-2" style={{ minHeight: 22 }}>
                  {formDirty ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold border border-amber-500/20" style={{ minWidth: 72 }}>
                      <MI size={12}>edit</MI> Modified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-300 text-[10px] font-semibold border border-transparent" style={{ minWidth: 72 }}>
                      <MI size={12}>check</MI> Saved
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-surface-900 dark:text-white leading-tight mb-2">
                  {formValues.title || "Untitled"}
                </h2>

                {/* Path */}
                <div className="w-full rounded-md bg-surface-100 dark:bg-surface-800/40 px-3 py-1.5 mb-6">
                  <code className="text-[11px] text-surface-500">
                    posts/{selectedEntityId}
                  </code>
                </div>

                {/* Form fields */}
                <div className="flex flex-col gap-3">
                  {/* Title field */}
                  <div className="relative rounded-md bg-surface-100 dark:bg-surface-800/60 min-h-[48px] flex flex-col justify-center">
                    <span className="absolute top-1.5 left-3 text-[10px] font-medium text-primary">
                      Title <span className="text-red-400">*</span>
                    </span>
                    <div className="px-3 pt-6 pb-2 text-sm text-surface-900 dark:text-surface-200">
                      {formValues.title}
                    </div>
                  </div>

                  {/* Image field */}
                  <div className="relative rounded-md bg-surface-100 dark:bg-surface-800/60 min-h-[64px] flex flex-col">
                    <span className="absolute top-1.5 left-3 text-[10px] font-medium text-surface-400">
                      Image
                    </span>
                    <div className="px-3 pt-6 pb-2">
                      {formValues.image ? (
                        <img src={formValues.image} alt="" className="w-[100px] h-[100px] object-cover rounded-md" />
                      ) : (
                        <div className="w-[100px] h-[100px] rounded-md bg-surface-200/40 dark:bg-surface-700/50 flex items-center justify-center">
                          <MI size={24} className="text-surface-400">image</MI>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status field */}
                  <div className={`relative rounded-md bg-surface-100 dark:bg-surface-800/60 min-h-[48px] flex flex-col justify-center transition-all duration-300 ${highlightedFormField === "status" ? "ring-2 ring-green-500" : ""}`}>
                    <span className="absolute top-1.5 left-3 text-[10px] font-medium text-surface-400">
                      Status
                    </span>
                    <div className="px-3 pt-6 pb-2 flex items-center justify-between">
                      {formValues.status && (
                        <span
                          className="rounded-lg inline-flex items-center px-2.5 py-0.5 text-xs font-normal"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[formValues.status]?.bg,
                            color: STATUS_COLORS[formValues.status]?.text,
                          }}
                        >
                          {formValues.status}
                        </span>
                      )}
                      <MI size={18} className="text-surface-400">
                        expand_more
                      </MI>
                    </div>
                  </div>

                  {/* Author field */}
                  <div className="relative rounded-md bg-surface-100 dark:bg-surface-800/60 min-h-[48px] flex flex-col justify-center">
                    <span className="absolute top-1.5 left-3 text-[10px] font-medium text-surface-400">
                      Author
                    </span>
                    <div className="px-3 pt-6 pb-2 flex items-center justify-between">
                      {formValues.author ? (
                        <div className="flex items-center gap-2">
                          <MI size={20} className="text-primary">
                            person
                          </MI>
                          <div>
                            <div className="text-sm font-medium text-surface-900 dark:text-white">
                              {formValues.author.name}
                            </div>
                            <div className="text-xs text-surface-500">
                              {formValues.author.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-surface-400 text-sm">—</span>
                      )}
                      <MI size={18} className="text-surface-400">
                        expand_more
                      </MI>
                    </div>
                  </div>

                  {/* Tags field */}
                  <div className="relative rounded-md bg-surface-100 dark:bg-surface-800/60 min-h-[48px] flex flex-col justify-center">
                    <span className="absolute top-1.5 left-3 text-[10px] font-medium text-surface-400">
                      Tags
                    </span>
                    <div className="px-3 pt-6 pb-2 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1 flex-1">
                        {(formValues.tags || []).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-lg inline-flex items-center gap-0.5 px-2 py-0.5 text-xs bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200"
                          >
                            <MI
                              size={12}
                              className="text-primary opacity-70"
                            >
                              tag
                            </MI>
                            {tag}
                            <MI
                              size={14}
                              className="text-surface-400 ml-0.5"
                            >
                              close
                            </MI>
                          </span>
                        ))}
                        {(!formValues.tags ||
                          formValues.tags.length === 0) && (
                          <span className="text-surface-400 text-sm">
                            —
                          </span>
                        )}
                      </div>
                      <MI
                        size={18}
                        className="text-surface-400 flex-shrink-0"
                      >
                        expand_more
                      </MI>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel bottom bar */}
            <div className="flex items-center justify-between px-3 py-2.5 border-t border-surface-200/20 dark:border-surface-700/30 bg-white dark:bg-surface-900 shrink-0">
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded text-surface-500">
                  <MI size={16}>content_copy</MI>
                </button>
                <button className="p-1.5 rounded text-surface-500">
                  <MI size={16}>delete</MI>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-md text-surface-400 text-[11px] font-semibold uppercase">
                  Discard
                </button>
                <button
                  disabled={!formDirty || isSaving}
                  className="px-3 py-1.5 rounded-md text-surface-500 text-[11px] font-semibold uppercase disabled:opacity-30"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button className="px-3 py-1.5 rounded-md bg-primary text-white text-[11px] font-semibold uppercase">
                  Save and Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
