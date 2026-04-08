import React, { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────
interface StorageItem {
    name: string;
    fullPath: string;
    isFolder: boolean;
    size?: number;
    contentType?: string;
    updatedAt?: string;
}

// ─── Mock Data ───────────────────────────────────────────
const MOCK_FILES: Record<string, StorageItem[]> = {
    "": [
        { name: "uploads", fullPath: "uploads", isFolder: true },
        { name: "avatars", fullPath: "avatars", isFolder: true },
        { name: "exports", fullPath: "exports", isFolder: true },
        { name: "README.md", fullPath: "README.md", isFolder: false, size: 2048, contentType: "text/markdown", updatedAt: "2025-03-15" },
    ],
    uploads: [
        { name: "images", fullPath: "uploads/images", isFolder: true },
        { name: "documents", fullPath: "uploads/documents", isFolder: true },
        { name: "invoice-2025-001.pdf", fullPath: "uploads/invoice-2025-001.pdf", isFolder: false, size: 245760, contentType: "application/pdf", updatedAt: "2025-03-20" },
        { name: "report-q1.xlsx", fullPath: "uploads/report-q1.xlsx", isFolder: false, size: 1048576, contentType: "application/vnd.ms-excel", updatedAt: "2025-03-18" },
    ],
    "uploads/images": [
        { name: "hero-banner.webp", fullPath: "uploads/images/hero-banner.webp", isFolder: false, size: 524288, contentType: "image/webp", updatedAt: "2025-01-10" },
        { name: "product-shot.png", fullPath: "uploads/images/product-shot.png", isFolder: false, size: 2097152, contentType: "image/png", updatedAt: "2025-02-14" },
        { name: "team-photo.jpg", fullPath: "uploads/images/team-photo.jpg", isFolder: false, size: 3145728, contentType: "image/jpeg", updatedAt: "2025-03-01" },
        { name: "logo.svg", fullPath: "uploads/images/logo.svg", isFolder: false, size: 8192, contentType: "image/svg+xml", updatedAt: "2024-12-01" },
    ],
    avatars: [
        { name: "alice.jpg", fullPath: "avatars/alice.jpg", isFolder: false, size: 51200, contentType: "image/jpeg", updatedAt: "2025-01-15" },
        { name: "bob.jpg", fullPath: "avatars/bob.jpg", isFolder: false, size: 49152, contentType: "image/jpeg", updatedAt: "2025-02-20" },
        { name: "eve.png", fullPath: "avatars/eve.png", isFolder: false, size: 65536, contentType: "image/png", updatedAt: "2025-03-10" },
    ],
    exports: [
        { name: "users-export-20250315.csv", fullPath: "exports/users-export-20250315.csv", isFolder: false, size: 32768, contentType: "text/csv", updatedAt: "2025-03-15" },
        { name: "orders-backup.json", fullPath: "exports/orders-backup.json", isFolder: false, size: 131072, contentType: "application/json", updatedAt: "2025-03-12" },
    ],
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFileExtension(name: string): string {
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

function getFileIconColor(contentType?: string): string {
    if (!contentType) return "text-surface-400";
    if (contentType.startsWith("image/")) return "text-pink-400";
    if (contentType.startsWith("video/")) return "text-purple-400";
    if (contentType.startsWith("audio/")) return "text-indigo-400";
    if (contentType.includes("pdf")) return "text-red-400";
    if (contentType.includes("spreadsheet") || contentType.includes("excel")) return "text-green-400";
    if (contentType.includes("json")) return "text-amber-400";
    if (contentType.includes("csv")) return "text-cyan-400";
    return "text-surface-400";
}

// ─── Component ───────────────────────────────────────────
export function StorageViewDemo() {
    const [currentPath, setCurrentPath] = useState("");
    const [selectedFile, setSelectedFile] = useState<StorageItem | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const items = MOCK_FILES[currentPath] ?? [];
    const folders = items.filter(i => i.isFolder);
    const files = items.filter(i => !i.isFolder);

    const breadcrumbs = [
        { label: "Root", path: "" },
        ...currentPath.split("/").filter(Boolean).reduce<{ label: string; path: string }[]>((acc, part) => {
            const prev = acc.length > 0 ? acc[acc.length - 1].path : "";
            acc.push({ label: part, path: prev ? `${prev}/${part}` : part });
            return acc;
        }, []),
    ];

    const handleNavigate = useCallback((path: string) => {
        setCurrentPath(path);
        setSelectedFile(null);
    }, []);

    // Get all folder paths for sidebar
    const allFolders = Object.keys(MOCK_FILES).filter(k => k !== "");

    return (
        <div className="flex h-[480px] w-full rounded-xl overflow-hidden ring-1 ring-surface-700 bg-surface-950 shadow-2xl text-surface-300 text-sm">
            {/* ── Sidebar ── */}
            <div className="w-[170px] border-r border-surface-800/40 flex flex-col shrink-0">
                <div className="p-3 border-b border-surface-800/40 bg-surface-900/40 shrink-0">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-surface-500">Folders</span>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5">
                    <button
                        onClick={() => handleNavigate("")}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded w-full text-left text-xs transition-colors ${
                            currentPath === "" ? "bg-primary/10 text-primary" : "text-surface-400 hover:bg-surface-800/40"
                        }`}
                    >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                        Root
                    </button>
                    {allFolders.map(folder => {
                        const parts = folder.split("/");
                        const indent = parts.length - 1;
                        const label = parts[parts.length - 1];
                        return (
                            <button
                                key={folder}
                                onClick={() => handleNavigate(folder)}
                                style={{ paddingLeft: `${8 + indent * 12}px` }}
                                className={`flex items-center gap-1.5 py-1.5 pr-2 rounded w-full text-left text-xs transition-colors ${
                                    currentPath === folder ? "bg-primary/10 text-primary" : "text-surface-400 hover:bg-surface-800/40"
                                }`}
                            >
                                <svg className="w-3.5 h-3.5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                                <span className="truncate">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Main Panel ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-surface-800/40 bg-surface-900/30 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] overflow-x-auto">
                        {breadcrumbs.map((crumb, i) => (
                            <React.Fragment key={crumb.path}>
                                {i > 0 && <span className="text-surface-600 mx-0.5">/</span>}
                                <button
                                    onClick={() => handleNavigate(crumb.path)}
                                    className={`hover:text-primary transition-colors font-mono ${
                                        i === breadcrumbs.length - 1 ? "text-surface-300 font-medium" : "text-surface-500"
                                    }`}
                                >
                                    {crumb.label}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {/* View toggle */}
                        <div className="flex rounded bg-surface-800/60 p-0.5">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-1 rounded transition-colors ${viewMode === "grid" ? "bg-surface-700 text-white" : "text-surface-500 hover:text-surface-300"}`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-1 rounded transition-colors ${viewMode === "list" ? "bg-surface-700 text-white" : "text-surface-500 hover:text-surface-300"}`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
                            </button>
                        </div>
                        <button
                            className="text-surface-500 hover:text-surface-300 transition-colors"
                            title="Refresh"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        </button>
                        <button
                            onClick={() => setShowUploadDialog(!showUploadDialog)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-semibold hover:bg-primary/30 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                            Upload
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div
                    className={`flex-1 overflow-auto p-4 transition-colors ${dragActive ? "bg-primary/5" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                >
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {/* Navigate up */}
                            {currentPath && (
                                <button
                                    onClick={() => {
                                        const parts = currentPath.split("/").filter(Boolean);
                                        parts.pop();
                                        handleNavigate(parts.join("/"));
                                    }}
                                    className="flex flex-col items-center justify-center p-4 rounded-lg border border-dashed border-surface-800/40 hover:border-surface-600 hover:bg-surface-800/20 transition-colors text-surface-500 cursor-pointer"
                                >
                                    <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                                    <span className="text-[11px]">Back</span>
                                </button>
                            )}
                            {/* Folders */}
                            {folders.map(folder => (
                                <button
                                    key={folder.fullPath}
                                    onClick={() => handleNavigate(folder.fullPath)}
                                    className="flex flex-col items-center justify-center p-4 rounded-lg border border-surface-800/40 hover:border-surface-600 hover:bg-surface-800/20 transition-all text-surface-300 cursor-pointer group"
                                >
                                    <svg className="w-10 h-10 mb-2 text-amber-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                                    <span className="text-[11px] font-medium truncate max-w-full">{folder.name}</span>
                                </button>
                            ))}
                            {/* Files */}
                            {files.map(file => (
                                <button
                                    key={file.fullPath}
                                    onClick={() => setSelectedFile(selectedFile?.fullPath === file.fullPath ? null : file)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all cursor-pointer group ${
                                        selectedFile?.fullPath === file.fullPath
                                            ? "border-primary/40 bg-primary/5"
                                            : "border-surface-800/40 hover:border-surface-600 hover:bg-surface-800/20"
                                    }`}
                                >
                                    <div className={`w-10 h-10 mb-2 flex items-center justify-center ${getFileIconColor(file.contentType)} group-hover:scale-110 transition-transform`}>
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    </div>
                                    <span className="text-[11px] font-medium truncate max-w-full">{file.name}</span>
                                    <span className="text-[9px] text-surface-600 mt-0.5">{formatFileSize(file.size ?? 0)}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-surface-800/40 text-left text-[10px] uppercase tracking-wider text-surface-600">
                                    <th className="px-3 py-2 font-bold">Name</th>
                                    <th className="px-3 py-2 font-bold w-20">Type</th>
                                    <th className="px-3 py-2 font-bold w-24 text-right">Size</th>
                                    <th className="px-3 py-2 font-bold w-24 text-right">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPath && (
                                    <tr
                                        className="hover:bg-surface-800/30 cursor-pointer transition-colors border-b border-surface-800/20"
                                        onClick={() => {
                                            const parts = currentPath.split("/").filter(Boolean);
                                            parts.pop();
                                            handleNavigate(parts.join("/"));
                                        }}
                                    >
                                        <td className="px-3 py-2 text-surface-500 text-xs" colSpan={4}>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                                                ..
                                            </span>
                                        </td>
                                    </tr>
                                )}
                                {folders.map(folder => (
                                    <tr
                                        key={folder.fullPath}
                                        className="hover:bg-surface-800/30 cursor-pointer transition-colors border-b border-surface-800/20"
                                        onClick={() => handleNavigate(folder.fullPath)}
                                    >
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                                                <span className="text-xs font-medium">{folder.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-[11px] text-surface-500">Folder</td>
                                        <td className="px-3 py-2 text-right text-[11px] text-surface-600">—</td>
                                        <td className="px-3 py-2 text-right text-[11px] text-surface-600">—</td>
                                    </tr>
                                ))}
                                {files.map(file => (
                                    <tr
                                        key={file.fullPath}
                                        className={`cursor-pointer transition-colors border-b border-surface-800/20 ${
                                            selectedFile?.fullPath === file.fullPath ? "bg-primary/5" : "hover:bg-surface-800/30"
                                        }`}
                                        onClick={() => setSelectedFile(selectedFile?.fullPath === file.fullPath ? null : file)}
                                    >
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <svg className={`w-4 h-4 shrink-0 ${getFileIconColor(file.contentType)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                                <span className="text-xs truncate">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-[11px] text-surface-500 font-mono">{getFileExtension(file.name)}</td>
                                        <td className="px-3 py-2 text-right text-[11px] text-surface-500 font-mono">{formatFileSize(file.size ?? 0)}</td>
                                        <td className="px-3 py-2 text-right text-[11px] text-surface-500">{file.updatedAt ?? "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Upload overlay */}
                    {showUploadDialog && (
                        <div className="mt-4 p-6 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 text-center">
                            <svg className="w-10 h-10 mx-auto mb-3 text-primary opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                            <p className="text-sm text-surface-300 font-medium mb-1">Drop files here or click to browse</p>
                            <p className="text-[11px] text-surface-500">Any file type supported</p>
                            <button
                                onClick={() => setShowUploadDialog(false)}
                                className="mt-3 px-3 py-1.5 rounded bg-surface-800/60 text-surface-400 text-[10px] font-semibold hover:text-surface-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Preview Panel ── */}
            {selectedFile && !selectedFile.isFolder && (
                <div className="w-[220px] border-l border-surface-800/40 flex flex-col shrink-0 bg-surface-950">
                    <div className="flex items-center justify-between p-3 border-b border-surface-800/40 shrink-0">
                        <span className="text-xs font-medium truncate flex-1 mr-2">{selectedFile.name}</span>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="text-surface-500 hover:text-surface-300 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-surface-900/30 border-b border-surface-800/40">
                        {selectedFile.contentType?.startsWith("image/") ? (
                            <div className="w-full h-32 rounded bg-surface-800/40 flex items-center justify-center">
                                <svg className="w-12 h-12 text-pink-400 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            </div>
                        ) : (
                            <div className={`w-12 h-12 ${getFileIconColor(selectedFile.contentType)}`}>
                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </div>
                        )}
                    </div>
                    <div className="p-3 space-y-3 overflow-y-auto flex-1">
                        <div>
                            <span className="text-[10px] text-surface-600 uppercase tracking-wider font-bold block mb-1">File Info</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] text-surface-600 block">Type</span>
                                <span className="text-[11px] font-mono">{getFileExtension(selectedFile.name)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-surface-600 block">Size</span>
                                <span className="text-[11px] font-mono">{formatFileSize(selectedFile.size ?? 0)}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-surface-600 block">Path</span>
                            <span className="text-[10px] font-mono text-primary break-all">{selectedFile.fullPath}</span>
                        </div>
                        <div className="pt-2 flex gap-2">
                            <button className="flex-1 px-2 py-1.5 rounded bg-surface-800/60 text-surface-400 text-[10px] font-medium hover:text-surface-300 transition-colors text-center">
                                Download
                            </button>
                            <button className="px-2 py-1.5 rounded bg-red-900/20 text-red-400 text-[10px] font-medium hover:bg-red-900/30 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
