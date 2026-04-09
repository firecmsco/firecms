/**
 * UIReferenceView — hidden debug route at /debug/ui
 *
 * This file is a STATIC reference of the real UI patterns used across the app.
 * All markup / styles are copied verbatim from source files.
 * DO NOT add invented styles. Only copy from actual source files.
 *
 * Sources:
 *   DefaultDrawer.tsx, DefaultAppBar.tsx, DrawerNavigationItem.tsx,
 *   DrawerNavigationGroup.tsx, UsersView.tsx, RolesView.tsx
 */
import React, { useState } from "react";
import {
    AddIcon,
    Alert,
    Avatar,
    BooleanSwitch,
    BrightnessMediumIcon,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    cls,
    DarkModeIcon,
    defaultBorderMixin,
    DeleteIcon,
    EditIcon,
    ExpandMoreIcon,
    FilterListIcon,
    IconButton,
    KeyboardDoubleArrowLeftIcon,
    KeyboardDoubleArrowRightIcon,
    LightModeIcon,
    LoadingButton,
    LogoutIcon,
    Menu,
    MenuItem,
    MultiSelect,
    MultiSelectItem,
    SearchBar,
    Select,
    SelectItem,
    Separator,
    SettingsIcon,
    Skeleton,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    ViewKanbanIcon,
    AppsIcon,
    ListIcon,
    PersonIcon,
    FolderIcon,
    LabelIcon,
} from "@rebasepro/ui";
import { RebaseLogo } from "../RebaseLogo";

const SECTIONS = [
    { id: "drawer", label: "Drawer" },
    { id: "appbar", label: "App Bar" },
    { id: "tabs", label: "Tabs" },
    { id: "editor-sidebar", label: "Editor Sidebar" },
    { id: "empty-states", label: "Empty States" },
    { id: "typography", label: "Typography" },
    { id: "buttons", label: "Buttons" },
    { id: "inputs", label: "Form Inputs" },
    { id: "chips-alerts", label: "Chips & Alerts" },
    { id: "users", label: "Users View" },
    { id: "user-dialog", label: "User Dialog" },
    { id: "roles", label: "Roles View" },
    { id: "role-dialog", label: "Role Dialog" },
];

export function UIReferenceView() {
    const [activeSection, setActiveSection] = useState("drawer");

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(id);
    };

    return (
        <div className="flex h-full w-full overflow-hidden">

            {/* ── Sidebar nav (same structure as DefaultDrawer) ─────────────── */}
            <div className={cls("flex flex-col h-full relative grow-0 shrink-0 w-[200px] border-r", defaultBorderMixin)}>
                {/* DrawerLogo */}
                <div className="flex flex-row items-center shrink-0 pt-4 pb-2 px-2">
                    <div className="shrink-0 flex items-center justify-center w-[56px] h-[40px]">
                        <RebaseLogo width="28px" height="28px" />
                    </div>
                    <Typography variant="subtitle1" noWrap className="truncate">UI Ref</Typography>
                </div>

                {/* Nav entries */}
                <div className="mt-3 flex-grow overflow-scroll no-scrollbar">
                    <div className="my-2 mx-2 flex flex-col">
                        {/* Group header — from DrawerNavigationGroup */}
                        <div className={cls("pl-4 pr-2 py-1 flex flex-row items-center transition-colors cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700/50 rounded-t-lg bg-surface-50 dark:bg-surface-800/30")}>
                            <ExpandMoreIcon size="smallest" className="text-surface-500 dark:text-surface-400 transition-transform duration-200 mr-1" />
                            <Typography variant="caption" color="secondary" className="font-medium flex-grow line-clamp-1">
                                SECTIONS
                            </Typography>
                        </div>
                        {/* Nav items — from DrawerNavigationItem */}
                        <div className="overflow-hidden bg-surface-50 dark:bg-surface-800/30 rounded-b-lg">
                            {SECTIONS.map(s => (
                                <div key={s.id}>
                                    <div
                                        onClick={() => scrollTo(s.id)}
                                        className={cls(
                                            "rounded-lg truncate",
                                            "hover:bg-surface-accent-300/75 dark:hover:bg-surface-accent-800/75 text-text-primary dark:text-surface-200 hover:text-surface-900 dark:hover:text-white",
                                            "flex flex-row items-center",
                                            "pr-4 h-10",
                                            "font-semibold text-xs cursor-pointer",
                                            activeSection === s.id ? "bg-surface-accent-200/60 dark:bg-surface-800 dark:bg-opacity-50" : ""
                                        )}
                                    >
                                        <div className="shrink-0 flex items-center justify-center w-[56px] h-[40px] text-text-secondary dark:text-text-secondary-dark">
                                            <SettingsIcon size={18} />
                                        </div>
                                        <div className="text-text-primary dark:text-surface-200 opacity-100 font-inherit truncate space-x-2">
                                            {s.label.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DrawerToggle — from DefaultDrawer */}
                <div className={cls("shrink-0 mt-auto border-t px-2 py-2", defaultBorderMixin)}>
                    <div className={cls(
                        "flex flex-row items-center rounded-lg cursor-pointer",
                        "hover:bg-surface-accent-100 dark:hover:bg-surface-800",
                        "transition-colors duration-150",
                        "py-2"
                    )}>
                        <div className="shrink-0 flex items-center justify-center w-[56px] h-[24px] text-surface-500 dark:text-surface-400">
                            <KeyboardDoubleArrowLeftIcon size="small" />
                        </div>
                        <Typography variant="body2" className="text-surface-500 dark:text-surface-400 select-none whitespace-nowrap">
                            Collapse
                        </Typography>
                    </div>
                </div>
            </div>

            {/* ── Main scroll area ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">

                {/* ═══════════════════════════════════════════════
                    SECTION: Drawer
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="drawer" title="Drawer — DefaultDrawer.tsx">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        The drawer wraps <code className="font-mono text-xs">DrawerLogo</code>, scrollable <code className="font-mono text-xs">DrawerNavigationGroup</code>s,
                        and <code className="font-mono text-xs">DrawerToggle</code>. Two visual states: collapsed (icon only, 72px) and expanded (280px).
                    </Typography>
                    <div className="flex gap-6 flex-wrap">

                        {/* Collapsed — exact markup from DefaultDrawer + DrawerNavigationItem */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-1">Collapsed (72px)</Typography>
                            <div className={cls("flex flex-col h-72 relative w-[72px] border rounded-lg overflow-hidden", defaultBorderMixin)}>
                                <div className="flex flex-row items-center shrink-0 pt-4 pb-2 px-2">
                                    <div className="shrink-0 flex items-center justify-center w-[56px] h-[40px]">
                                        <RebaseLogo width="28px" height="28px" />
                                    </div>
                                </div>
                                <div className="mt-3 flex-grow overflow-hidden">
                                    <div className="my-2 mx-2 flex flex-col">
                                        <div className="overflow-hidden rounded-lg bg-surface-50 dark:bg-surface-800/30">
                                            {[<FolderIcon size={18}/>, <PersonIcon size={18}/>, <LabelIcon size={18}/>].map((icon, i) => (
                                                <div key={i} className="rounded-lg truncate hover:bg-surface-accent-300/75 dark:hover:bg-surface-accent-800/75 flex flex-row items-center h-10">
                                                    <div className="shrink-0 flex items-center justify-center w-[56px] h-[40px] text-text-secondary dark:text-text-secondary-dark">
                                                        {icon}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className={cls("shrink-0 mt-auto border-t px-2 py-2", defaultBorderMixin)}>
                                    <div className="flex flex-row items-center rounded-lg cursor-pointer hover:bg-surface-accent-100 dark:hover:bg-surface-800 transition-colors duration-150 py-2">
                                        <div className="shrink-0 flex items-center justify-center w-[56px] h-[24px] text-surface-500 dark:text-surface-400">
                                            <KeyboardDoubleArrowRightIcon size="small" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded — exact markup from DefaultDrawer + DrawerNavigationGroup + DrawerNavigationItem */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-1">Expanded (280px)</Typography>
                            <div className={cls("flex flex-col h-72 relative w-[280px] border rounded-lg overflow-hidden", defaultBorderMixin)}>
                                {/* DrawerLogo */}
                                <div className="flex flex-row items-center shrink-0 pt-4 pb-2 px-2">
                                    <div className="shrink-0 flex items-center justify-center w-[56px] h-[40px]">
                                        <RebaseLogo width="28px" height="28px" />
                                    </div>
                                    <div className="flex flex-row items-center overflow-hidden transition-all duration-200 ease-in-out opacity-100 w-full ml-1">
                                        <Typography variant="subtitle1" noWrap className="truncate">Rebase</Typography>
                                    </div>
                                </div>
                                {/* DrawerNavigationGroup */}
                                <div className="mt-3 flex-grow overflow-hidden">
                                    <div className="my-2 mx-2 flex flex-col">
                                        <div className="pl-4 pr-2 py-1 flex flex-row items-center transition-colors cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700/50 rounded-t-lg bg-surface-50 dark:bg-surface-800/30">
                                            <ExpandMoreIcon size="smallest" className="text-surface-500 dark:text-surface-400 mr-1" />
                                            <Typography variant="caption" color="secondary" className="font-medium flex-grow line-clamp-1">CONTENT</Typography>
                                        </div>
                                        <div className="overflow-hidden bg-surface-50 dark:bg-surface-800/30 rounded-b-lg">
                                            {[
                                                { label: "Posts", icon: <FolderIcon size={18}/>, active: true },
                                                { label: "Authors", icon: <PersonIcon size={18}/>, active: false },
                                                { label: "Tags", icon: <LabelIcon size={18}/>, active: false }
                                            ].map(({ label, icon, active }) => (
                                                <div key={label} className={cls(
                                                    "rounded-lg truncate hover:bg-surface-accent-300/75 dark:hover:bg-surface-accent-800/75 text-text-primary dark:text-surface-200 hover:text-surface-900 dark:hover:text-white flex flex-row items-center pr-4 h-10 font-semibold text-xs cursor-pointer",
                                                    active ? "bg-surface-accent-200/60 dark:bg-surface-800 dark:bg-opacity-50" : ""
                                                )}>
                                                    <div className="shrink-0 flex items-center justify-center w-[56px] h-[40px] text-text-secondary dark:text-text-secondary-dark">
                                                        {icon}
                                                    </div>
                                                    <div className="text-text-primary dark:text-surface-200 font-inherit truncate">
                                                        {label.toUpperCase()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* DrawerToggle */}
                                <div className={cls("shrink-0 mt-auto border-t px-2 py-2", defaultBorderMixin)}>
                                    <div className="flex flex-row items-center rounded-lg cursor-pointer hover:bg-surface-accent-100 dark:hover:bg-surface-800 transition-colors duration-150 py-2">
                                        <div className="shrink-0 flex items-center justify-center w-[56px] h-[24px] text-surface-500 dark:text-surface-400">
                                            <KeyboardDoubleArrowLeftIcon size="small" />
                                        </div>
                                        <div className="overflow-hidden transition-all duration-200 ease-in-out opacity-100 w-auto">
                                            <Typography variant="body2" className="text-surface-500 dark:text-surface-400 select-none whitespace-nowrap">
                                                Collapse
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: AppBar
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="appbar" title="App Bar — DefaultAppBar.tsx">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        Fixed at top (<code className="font-mono text-xs">h-16 absolute top-0</code>). Contains breadcrumbs (caption + body2), Content/Studio pill toggle,
                        theme menu, and user avatar menu via <code className="font-mono text-xs">Menu</code>.
                    </Typography>
                    {/* Exact classes from DefaultAppBar line 121-130 */}
                    <div className={cls("w-full h-16 flex flex-row gap-2 px-4 items-center border rounded-lg relative", defaultBorderMixin)}>
                        {/* Breadcrumbs — from DefaultAppBar line 157-188 */}
                        <div className="mr-8 hidden lg:block">
                            <div className="flex flex-row gap-2 items-center">
                                <Typography variant="caption" color="secondary">/</Typography>
                                <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                                    <Typography variant="body2">Posts</Typography>
                                    <span className="text-xs text-surface-accent-500 dark:text-surface-accent-400 bg-surface-100 dark:bg-surface-700 px-1 py-0 rounded">42</span>
                                </div>
                                <Typography variant="caption" color="secondary">/</Typography>
                                <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                                    <Typography variant="body2">My Post</Typography>
                                </div>
                            </div>
                        </div>
                        <div className="grow" />
                        {/* Content/Studio toggle — from DefaultAppBar line 204-225 */}
                        <div className={cls("mr-2 hidden sm:flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5 border", defaultBorderMixin)}>
                            <button className={cls("px-3 py-1 text-xs font-semibold rounded-md transition-all", "bg-white dark:bg-surface-900 shadow-sm text-primary dark:text-primary-400")}>
                                Content
                            </button>
                            <button className={cls("px-3 py-1 text-xs font-semibold rounded-md transition-all", "text-surface-500 hover:text-surface-900 dark:hover:text-white")}>
                                Studio
                            </button>
                        </div>
                        {/* Theme menu — from DefaultAppBar line 227-241 */}
                        <Menu trigger={
                            <IconButton color="inherit">
                                <DarkModeIcon />
                            </IconButton>
                        }>
                            <MenuItem><DarkModeIcon size="smallest" /> Dark</MenuItem>
                            <MenuItem><LightModeIcon size="smallest" /> Light</MenuItem>
                            <MenuItem><BrightnessMediumIcon size="smallest" /> System</MenuItem>
                        </Menu>
                        {/* Avatar menu — from DefaultAppBar line 243-270 */}
                        <Menu trigger={<Avatar>A</Avatar>}>
                            <div className="px-4 py-2 mb-2">
                                <Typography variant="body1" color="secondary">Alice Johnson</Typography>
                                <Typography variant="body2" color="secondary">alice@example.com</Typography>
                            </div>
                            <MenuItem><SettingsIcon /> Account Settings</MenuItem>
                            <MenuItem><LogoutIcon /> Log Out</MenuItem>
                        </Menu>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Tabs
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="tabs" title="Tabs — Tabs.tsx">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        All editor components use <code className="font-mono text-xs">variant="boxy"</code> tabs for sidebar navigation.
                        The boxy variant provides a segmented, flat tab bar that integrates tightly with editor chrome.
                    </Typography>

                    <div className="flex flex-col gap-6">
                        {/* Default variant */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-2 font-mono">variant="default"</Typography>
                            <Tabs value="tab1" onValueChange={() => {}}>
                                <Tab value="tab1">Schema</Tab>
                                <Tab value="tab2">Snippets</Tab>
                                <Tab value="tab3">History</Tab>
                            </Tabs>
                        </div>

                        {/* Boxy variant — exact pattern from SQLEditorSidebar, JSEditorSidebar, RLSEditor */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-2 font-mono">variant="boxy" (Editor Standard)</Typography>
                            <div className={cls("border rounded-lg overflow-hidden w-[320px]", defaultBorderMixin)}>
                                <Tabs value="schema" onValueChange={() => {}} variant="boxy" className="border-b border-surface-200 dark:border-surface-800">
                                    <Tab value="schema">Schema</Tab>
                                    <Tab value="snippets">Snippets</Tab>
                                    <Tab value="history">History</Tab>
                                </Tabs>
                                {/* Section header pattern — used in all editor sidebars */}
                                <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                                    <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">TABLES</Typography>
                                    <IconButton size="small">
                                        <SettingsIcon size="smallest" />
                                    </IconButton>
                                </div>
                                <div className="p-2 h-24">
                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark italic p-2">Tab content area…</Typography>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar tabs — from SQLEditor/JSEditor main toolbar */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-2 font-mono">Toolbar Tabs (boxy, inline with controls)</Typography>
                            <div className={cls("border rounded-lg overflow-hidden flex items-center justify-between pr-2 bg-white dark:bg-surface-950", defaultBorderMixin)}>
                                <div className="flex items-center">
                                    <Tabs value="query1" onValueChange={() => {}} variant="boxy" className="w-[unset] flex-shrink-0">
                                        <Tab value="query1" className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                            Query 1
                                        </Tab>
                                        <Tab value="query2" className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                            Query 2
                                        </Tab>
                                    </Tabs>
                                    <IconButton size="small" className="ml-2 flex-shrink-0">
                                        <AddIcon />
                                    </IconButton>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button variant="text" size="small">Explain</Button>
                                    <div className="h-4 w-px bg-surface-200 dark:bg-surface-800" />
                                    <Button size="small" color="primary">Run</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Editor Sidebar
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="editor-sidebar" title="Editor Sidebar — Harmonized Pattern">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        All studio editor components (SQL, JS, RLS, Collection) share the same underlying sidebar foundation:
                        <code className="font-mono text-xs">Tabs variant="boxy"</code> at top (optional) → section header with uppercase label → scrollable list.
                        While SQL/JS/RLS use dense tree entries, the Collection Schema Editor uses larger items (<code className="font-mono text-xs">px-3 py-2</code>, <code className="font-mono text-xs">text-sm</code>) suitable for primary navigation.
                    </Typography>

                    <div className="flex gap-6 flex-wrap">
                        {/* SQL Editor Sidebar replica */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-1">SQL Editor Sidebar</Typography>
                            <div className={cls("flex flex-col h-72 w-[240px] border rounded-lg overflow-hidden", defaultBorderMixin)}>
                                <Tabs value="schema" onValueChange={() => {}} variant="boxy" className="border-b border-surface-200 dark:border-surface-800">
                                    <Tab value="schema">Schema</Tab>
                                    <Tab value="snippets">Snippets</Tab>
                                    <Tab value="history">History</Tab>
                                </Tabs>
                                <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                                    <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">TABLES</Typography>
                                    <IconButton size="small">
                                        <SettingsIcon size="smallest" />
                                    </IconButton>
                                </div>
                                <div className="flex-grow overflow-y-auto no-scrollbar p-1">
                                    {/* Schema tree items — from SchemaBrowser */}
                                    <div className="mb-2">
                                        <div className="flex items-center p-1 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors">
                                            <svg className="w-3 h-3 mr-1 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                                            <Typography variant="body2" className="text-text-primary dark:text-text-primary-dark font-medium text-xs">public</Typography>
                                        </div>
                                        <div className="ml-3 mt-1 space-y-1">
                                            {["users", "posts", "comments"].map(t => (
                                                <div key={t} className="flex items-center p-1 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors group">
                                                    <svg className="w-3.5 h-3.5 mr-1 shrink-0 text-text-disabled dark:text-text-disabled-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark text-xs truncate">{t}</Typography>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RLS Editor Sidebar replica */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-1">RLS Editor Sidebar</Typography>
                            <div className={cls("flex flex-col h-72 w-[240px] border rounded-lg overflow-hidden", defaultBorderMixin)}>
                                <Tabs value="tables" onValueChange={() => {}} variant="boxy" className="border-b border-surface-200 dark:border-surface-800">
                                    <Tab value="tables">Tables</Tab>
                                    <Tab value="info">Info</Tab>
                                </Tabs>
                                <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                                    <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">RLS</Typography>
                                    <IconButton size="small">
                                        <SettingsIcon size="smallest" />
                                    </IconButton>
                                </div>
                                <div className="flex-grow overflow-y-auto no-scrollbar p-1">
                                    <div className="mb-2">
                                        <div className="flex items-center p-1 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors">
                                            <svg className="w-3 h-3 mr-1 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                                            <Typography variant="body2" className="text-text-primary dark:text-text-primary-dark font-medium text-xs">public</Typography>
                                        </div>
                                        <div className="ml-3 mt-1 space-y-0.5">
                                            {[{ name: "users", enabled: true }, { name: "posts", enabled: true }, { name: "sessions", enabled: false }].map(t => (
                                                <div key={t.name} className={cls("flex items-center p-1 cursor-pointer rounded transition-colors", t.name === "users" ? "bg-primary/10 text-primary dark:bg-primary/20" : "hover:bg-surface-100 dark:hover:bg-surface-800 text-text-secondary")}>
                                                    <svg className="w-3.5 h-3.5 mr-1 shrink-0 text-text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    <Typography variant="body2" className="text-xs truncate flex-1">{t.name}</Typography>
                                                    <div className={cls("w-1.5 h-1.5 rounded-full shrink-0", t.enabled ? "bg-green-500" : "bg-orange-400 opacity-50")} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Collection Editor Sidebar replica */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-1">Collection Editor Sidebar</Typography>
                            <div className={cls("flex flex-col h-72 w-[240px] border rounded-lg overflow-hidden bg-white dark:bg-surface-950", defaultBorderMixin)}>
                                <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                                    <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">COLLECTIONS</Typography>
                                    <IconButton size="small">
                                        <AddIcon size="small" />
                                    </IconButton>
                                </div>
                                <div className="flex-grow overflow-y-auto no-scrollbar p-2 space-y-0.5">
                                    {[{ name: "Authors" }, { name: "Posts", selected: true }, { name: "Tags" }].map(c => (
                                        <div key={c.name} className={cls("flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md text-sm transition-colors", c.selected ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light" : "hover:bg-surface-100 dark:hover:bg-surface-800 text-text-secondary dark:text-text-secondary-dark")}>
                                            <FolderIcon size={18} className={cls(c.selected ? "text-primary dark:text-primary-light" : "text-text-secondary dark:text-text-secondary-dark")} />
                                            <span className="truncate flex-1">{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Empty States
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="empty-states" title="Empty States — Canonical Pattern">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        All empty / placeholder states share the same layout: a centered <code className="font-mono text-xs">flex-col</code> container
                        with <code className="font-mono text-xs">Typography variant="label"</code> for the message and a <code className="font-mono text-xs">Button</code> with <code className="font-mono text-xs">AddIcon</code> for the primary action.
                        Sources: <code className="font-mono text-xs">CollectionPropertiesEditorForm</code>, <code className="font-mono text-xs">CollectionsStudioView</code>, <code className="font-mono text-xs">CollectionStudioView</code>.
                    </Typography>

                    <div className="flex gap-6 flex-wrap">
                        {/* Property editor empty state */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-1">Property Editor (no selection)</Typography>
                            <div className={cls("flex flex-col items-center justify-center h-48 w-[320px] border rounded-lg", defaultBorderMixin)}>
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <Typography variant="label">
                                        Select a property to edit it
                                    </Typography>
                                    <Button>
                                        <AddIcon />
                                        Add new property
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Property editor empty collection state */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-1">Property Editor (empty collection)</Typography>
                            <div className={cls("flex flex-col items-center justify-center h-48 w-[320px] border rounded-lg", defaultBorderMixin)}>
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <Typography variant="label">
                                        Now you can add your first property
                                    </Typography>
                                    <Button>
                                        <AddIcon />
                                        Add new property
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Collection list empty state */}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-1">Collection List (no selection)</Typography>
                            <div className={cls("flex flex-col items-center justify-center h-48 w-[320px] border rounded-lg", defaultBorderMixin)}>
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <Typography variant="label">
                                        Select a collection or create a new one to start editing
                                    </Typography>
                                    <Button>
                                        <AddIcon />
                                        Add new collection
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Typography
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="typography" title="Typography">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        All variants from <code className="font-mono text-xs">Typography</code>. Colors: primary (default), secondary, disabled, error.
                    </Typography>
                    <div className="flex flex-col gap-3">
                        {(["h1","h2","h3","h4","h5","h6","subtitle1","subtitle2","body1","body2","caption","label","button"] as const).map(v => (
                            <div key={v} className={cls("flex items-baseline gap-4 border-b pb-3 last:border-0", defaultBorderMixin)}>
                                <span className="w-24 shrink-0 text-xs text-surface-400 font-mono">{v}</span>
                                <Typography variant={v}>The quick brown fox jumps over the lazy dog</Typography>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 flex-wrap mt-4">
                        {(["primary","secondary","disabled","error"] as const).map(c => (
                            <Typography key={c} color={c}>color="{c}"</Typography>
                        ))}
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Buttons
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="buttons" title="Buttons">
                    <div className="flex flex-col gap-6">
                        {(["filled","text"] as const).map(variant => (
                            <div key={variant}>
                                <Typography variant="caption" color="secondary" className="block mb-2 font-mono">variant="{variant}"</Typography>
                                <div className="flex flex-wrap gap-3 items-center">
                                    {(["primary","secondary","text","error","neutral"] as const).map(color => (
                                        <Button key={color} variant={variant} color={color}>{color}</Button>
                                    ))}
                                    <Button variant={variant} disabled>disabled</Button>
                                </div>
                            </div>
                        ))}
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-2 font-mono">sizes</Typography>
                            <div className="flex flex-wrap items-end gap-3">
                                {(["small","medium","large","xl","2xl"] as const).map(s => (
                                    <Button key={s} size={s}>{s}</Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-2 font-mono">IconButton</Typography>
                            <div className="flex flex-wrap gap-3 items-center">
                                {(["primary","secondary","inherit"] as const).map(c => (
                                    <IconButton key={c} color={c}><EditIcon /></IconButton>
                                ))}
                                {(["small","medium","large"] as const).map(s => (
                                    <IconButton key={s} size={s}><DeleteIcon /></IconButton>
                                ))}
                                <IconButton disabled><AddIcon /></IconButton>
                            </div>
                        </div>
                        <div>
                            <Typography variant="caption" color="secondary" className="block mb-2 font-mono">LoadingButton</Typography>
                            <div className="flex flex-wrap gap-3">
                                <LoadingButton loading={true}>Saving…</LoadingButton>
                                <LoadingButton loading={false}>Idle</LoadingButton>
                            </div>
                        </div>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Form Inputs
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="inputs" title="Form Inputs">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6">
                            <Typography variant="caption" color="secondary" className="block mb-2 font-mono">TextField</Typography>
                            <div className="flex flex-col gap-3">
                                <TextField label="Default" placeholder="Type something…" />
                                <TextField label="With value" value="Filled value" onChange={() => {}} />
                                <TextField label="Error state" error value="Bad value" onChange={() => {}} />
                                <TextField label="Disabled" disabled value="Read only" onChange={() => {}} />
                            </div>
                        </div>
                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-4">
                            <div>
                                <Typography variant="caption" color="secondary" className="block mb-2 font-mono">Select</Typography>
                                <Select label="Status" value="published" onValueChange={() => {}}>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </Select>
                            </div>
                            <div>
                                <Typography variant="caption" color="secondary" className="block mb-2 font-mono">MultiSelect</Typography>
                                <MultiSelect label="Roles" value={["admin", "editor"]} onValueChange={() => {}}>
                                    <MultiSelectItem value="admin">Admin</MultiSelectItem>
                                    <MultiSelectItem value="editor">Editor</MultiSelectItem>
                                    <MultiSelectItem value="viewer">Viewer</MultiSelectItem>
                                </MultiSelect>
                            </div>
                        </div>
                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-3">
                            <Typography variant="caption" color="secondary" className="block font-mono">Checkbox</Typography>
                            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={true} onCheckedChange={() => {}} /><span>Checked</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={false} onCheckedChange={() => {}} /><span>Unchecked</span></label>
                            <label className="flex items-center gap-2"><Checkbox checked={true} disabled /><span>Disabled</span></label>
                        </div>
                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-3">
                            <Typography variant="caption" color="secondary" className="block font-mono">BooleanSwitch</Typography>
                            <div className="flex items-center gap-2"><BooleanSwitch value={true} onValueChange={() => {}} /><span>On</span></div>
                            <div className="flex items-center gap-2"><BooleanSwitch value={false} onValueChange={() => {}} /><span>Off</span></div>
                        </div>
                        <div className="col-span-12">
                            <Typography variant="caption" color="secondary" className="block mb-2 font-mono">SearchBar</Typography>
                            <SearchBar placeholder="Search entities…" />
                        </div>
                        <div className="col-span-12">
                            <Typography variant="caption" color="secondary" className="block mb-2 font-mono">Skeleton</Typography>
                            <div className="flex gap-4 items-center flex-wrap">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="w-48 h-4 rounded" />
                                <Skeleton className="w-32 h-8 rounded-md" />
                            </div>
                        </div>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Chips & Alerts
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="chips-alerts" title="Chips & Alerts">
                    <Typography variant="caption" color="secondary" className="block mb-2 font-mono">Chip — colorScheme × size</Typography>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(["grayLight","grayDark","redLight","redDark","blueDark","blueLight","greenDark","greenLight","yellowLight","yellowDark","orangeLight","purpleDark","pinkLight"] as const).map(s => (
                            <Chip key={s} colorScheme={s} size="small">{s}</Chip>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {(["smallest","small","medium"] as const).map(sz => (
                            <Chip key={sz} colorScheme="blueDark" size={sz}>{sz}</Chip>
                        ))}
                    </div>
                    <Typography variant="caption" color="secondary" className="block mb-2 font-mono">Alert — color variants</Typography>
                    <div className="flex flex-col gap-2">
                        <Alert color="info">Info — informational message</Alert>
                        <Alert color="success">Success — operation completed</Alert>
                        <Alert color="warning">Warning — attention required</Alert>
                        <Alert color="error">Error — something went wrong</Alert>
                    </div>
                    <div className="mt-4">
                        <Typography variant="caption" color="secondary" className="block mb-2 font-mono">Separator</Typography>
                        <div>Above</div>
                        <Separator orientation="horizontal" />
                        <div>Below</div>
                    </div>
                    <div className="mt-4">
                        <Typography variant="caption" color="secondary" className="block mb-2 font-mono">CircularProgress</Typography>
                        <div className="flex gap-6 items-center">
                            {(["small","medium","large"] as const).map(s => (
                                <div key={s} className="flex flex-col items-center gap-1">
                                    <CircularProgress size={s} />
                                    <Typography variant="caption" color="secondary">{s}</Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Users View
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="users" title="Users View — UsersView.tsx">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        Layout from <code className="font-mono text-xs">UsersView</code>: <code className="font-mono text-xs">Container maxWidth="6xl"</code>, header row, and table with <code className="font-mono text-xs">RoleChip</code>s.
                    </Typography>
                    {/* Bootstrap warning — from UsersView line 105-119 */}
                    <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded p-4 flex items-center justify-between mb-4">
                        <div>
                            <Typography variant="label" className="text-yellow-800 dark:text-yellow-200">
                                No admin users exist. You can make yourself an admin.
                            </Typography>
                        </div>
                        <Button>Make me admin</Button>
                    </div>
                    {/* Header — from UsersView line 121-128 */}
                    <div className="flex items-center mt-12">
                        <Typography gutterBottom variant="h4" className="grow" component="h4">Users</Typography>
                        <Button startIcon={<AddIcon />}>Add user</Button>
                    </div>
                    {/* Table — from UsersView line 130-182 */}
                    <div className="overflow-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableCell header className="truncate w-16"></TableCell>
                                <TableCell header>Email</TableCell>
                                <TableCell header>Name</TableCell>
                                <TableCell header>Roles</TableCell>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { uid: "1", email: "alice@example.com", displayName: "Alice Johnson", roles: [{ id: "admin", name: "Admin", isAdmin: true }] },
                                    { uid: "2", email: "bob@example.com", displayName: "Bob Smith", roles: [{ id: "editor", name: "Editor", isAdmin: false }] },
                                    { uid: "3", email: "carol@example.com", displayName: "Carol White", roles: [] },
                                ].map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell style={{ width: "64px" }}>
                                            <Tooltip asChild title="Delete this user">
                                                <IconButton size="small"><DeleteIcon /></IconButton>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="font-medium">{user.displayName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.map(role => (
                                                    <Chip key={role.id} colorScheme={role.isAdmin ? "purpleDark" : "blueDark"} size="small">
                                                        {role.name}
                                                    </Chip>
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: User Dialog
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="user-dialog" title="User Dialog — UserDetailsForm">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        Exact structure of <code className="font-mono text-xs">UserDetailsForm</code>: <code className="font-mono text-xs">grid grid-cols-12 gap-4</code>, <code className="font-mono text-xs">MultiSelect</code> for roles, <code className="font-mono text-xs">LoadingButton</code> to submit.
                    </Typography>
                    <div className={`rounded-lg border w-full max-w-xl ${defaultBorderMixin}`}>
                        <div className="px-6 pt-6 pb-2">
                            <Typography variant="h4">User</Typography>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12">
                                    <TextField name="displayName" required value="Alice Johnson" onChange={() => {}} label="Name" />
                                </div>
                                <div className="col-span-12">
                                    <TextField required name="email" value="alice@example.com" onChange={() => {}} label="Email" disabled />
                                </div>
                                <div className="col-span-12">
                                    <MultiSelect className="w-full" label="Roles" value={["admin"]} onValueChange={() => {}}>
                                        <MultiSelectItem value="admin">Admin</MultiSelectItem>
                                        <MultiSelectItem value="editor">Editor</MultiSelectItem>
                                        <MultiSelectItem value="viewer">Viewer</MultiSelectItem>
                                    </MultiSelect>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-6 pb-6">
                            <Button variant="text">Cancel</Button>
                            <LoadingButton variant="filled" loading={false}>Update</LoadingButton>
                        </div>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Roles View
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="roles" title="Roles View — RolesView.tsx">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        Layout from <code className="font-mono text-xs">RolesView</code>: same header pattern, table, and <code className="font-mono text-xs">CollectionPermissionsMatrix</code> with <code className="font-mono text-xs">defaultBorderMixin</code>.
                    </Typography>
                    <div className="flex items-center mt-12">
                        <Typography gutterBottom variant="h4" className="grow" component="h4">Roles</Typography>
                        <Button startIcon={<AddIcon />}>Add role</Button>
                    </div>
                    <div className="w-full overflow-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableCell header className="w-16"></TableCell>
                                <TableCell header>Role</TableCell>
                                <TableCell header className="items-center">Is Admin</TableCell>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { id: "admin", name: "Admin", isAdmin: true },
                                    { id: "editor", name: "Editor", isAdmin: false },
                                    { id: "viewer", name: "Viewer", isAdmin: false },
                                ].map(role => (
                                    <TableRow key={role.id}>
                                        <TableCell style={{ width: "64px" }}>
                                            {!role.isAdmin && (
                                                <Tooltip asChild title="Delete this role">
                                                    <IconButton size="small"><DeleteIcon /></IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip colorScheme={role.isAdmin ? "purpleDark" : "blueDark"} size="small">{role.name}</Chip>
                                        </TableCell>
                                        <TableCell className="items-center">
                                            <Checkbox checked={role.isAdmin ?? false} disabled />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* CollectionPermissionsMatrix — from RolesView line 365-406 */}
                    <div className="mt-4">
                        <Typography variant="label" className="mb-2 block text-surface-500 dark:text-surface-400 uppercase tracking-wide text-xs">
                            Collection permissions
                        </Typography>
                        <div className={`rounded-lg overflow-hidden border w-full ${defaultBorderMixin}`}>
                            <Table className="w-full">
                                <TableHeader>
                                    <TableCell header>Collection</TableCell>
                                    {["Read", "Create", "Edit", "Delete"].map(op => (
                                        <TableCell key={op} header align="center" className="w-20">{op}</TableCell>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {[{ name: "Posts", slug: "posts" }, { name: "Authors", slug: "authors" }].map(col => (
                                        <TableRow key={col.slug}>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium">{col.name}</span>
                                                    <Tooltip title="No security rules defined — all operations unrestricted">
                                                        <Chip size="smallest" colorScheme="grayLight">no rules</Chip>
                                                    </Tooltip>
                                                </div>
                                                <span className="text-xs text-surface-400 font-mono">{col.slug}</span>
                                            </TableCell>
                                            {["select", "insert", "update", "delete"].map(op => (
                                                <TableCell key={op} align="center" className="w-20">
                                                    <span className="text-green-500 dark:text-green-400 font-bold">✓</span>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </SectionBlock>

                {/* ═══════════════════════════════════════════════
                    SECTION: Role Dialog
                ═══════════════════════════════════════════════ */}
                <SectionBlock id="role-dialog" title="Role Dialog — RoleDetailsForm">
                    <Typography variant="body2" color="secondary" className="mb-4">
                        Exact structure of <code className="font-mono text-xs">RoleDetailsForm</code>: <code className="font-mono text-xs">col-span-4</code> grid, Role ID + Name + Is Admin checkbox.
                    </Typography>
                    <div className={`rounded-lg border w-full max-w-xl ${defaultBorderMixin}`}>
                        <div className="px-6 pt-6 pb-2">
                            <Typography variant="h4">Role</Typography>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 sm:col-span-4">
                                    <TextField name="id" required value="editor" onChange={() => {}} label="Role ID" disabled />
                                </div>
                                <div className="col-span-12 sm:col-span-4">
                                    <TextField name="name" required value="Editor" onChange={() => {}} label="Role Name" />
                                </div>
                                <div className="col-span-12 sm:col-span-4 flex items-start pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer mt-3">
                                        <Checkbox checked={false} onCheckedChange={() => {}} />
                                        <span className="font-medium">Is Admin</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-6 pb-6">
                            <Button variant="text">Cancel</Button>
                            <LoadingButton variant="filled" loading={false}>Update</LoadingButton>
                        </div>
                    </div>
                </SectionBlock>

                {/* Footer */}
                <div className="px-6 py-8">
                    <Typography variant="caption" color="secondary">
                        Hidden debug reference — <code className="font-mono text-xs">/debug/ui</code>. Not linked from sidebar.
                    </Typography>
                </div>
            </div>
        </div>
    );
}

function SectionBlock({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className={cls("px-6 py-8 border-b scroll-mt-0 max-w-5xl", defaultBorderMixin)}>
            <Typography variant="h5" className="mb-1">{title}</Typography>
            <div className="mt-4">{children}</div>
        </section>
    );
}
