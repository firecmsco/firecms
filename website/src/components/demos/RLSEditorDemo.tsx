import React, { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────
interface RLSPolicy {
    id: string;
    name: string;
    command: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
    using: string;
    withCheck?: string;
    roles: string[];
    permissive: boolean;
    syncStatus: "synced" | "unapplied" | "code-only" | "db-only";
}

interface RLSTable {
    name: string;
    schema: string;
    rlsEnabled: boolean;
    policies: RLSPolicy[];
}

// ─── Mock Data ───────────────────────────────────────────
const MOCK_TABLES: RLSTable[] = [
    {
        name: "users",
        schema: "public",
        rlsEnabled: true,
        policies: [
            {
                id: "1",
                name: "users_read_own",
                command: "SELECT",
                using: "auth.uid() = id",
                roles: ["public"],
                permissive: true,
                syncStatus: "synced",
            },
            {
                id: "2",
                name: "users_update_own",
                command: "UPDATE",
                using: "auth.uid() = id",
                withCheck: "auth.uid() = id",
                roles: ["public"],
                permissive: true,
                syncStatus: "synced",
            },
            {
                id: "3",
                name: "admin_full_access",
                command: "ALL",
                using: "auth.role() = 'admin'",
                roles: ["admin"],
                permissive: true,
                syncStatus: "unapplied",
            },
        ],
    },
    {
        name: "posts",
        schema: "public",
        rlsEnabled: true,
        policies: [
            {
                id: "4",
                name: "posts_read_all",
                command: "SELECT",
                using: "true",
                roles: ["public"],
                permissive: true,
                syncStatus: "synced",
            },
            {
                id: "5",
                name: "posts_write_author",
                command: "INSERT",
                using: "auth.uid() = author_id",
                withCheck: "auth.uid() = author_id",
                roles: ["authenticated"],
                permissive: true,
                syncStatus: "synced",
            },
        ],
    },
    {
        name: "comments",
        schema: "public",
        rlsEnabled: true,
        policies: [
            {
                id: "6",
                name: "comments_read_all",
                command: "SELECT",
                using: "true",
                roles: ["public"],
                permissive: true,
                syncStatus: "synced",
            },
        ],
    },
    {
        name: "orders",
        schema: "public",
        rlsEnabled: false,
        policies: [],
    },
    {
        name: "products",
        schema: "public",
        rlsEnabled: true,
        policies: [
            {
                id: "7",
                name: "products_read_all",
                command: "SELECT",
                using: "true",
                roles: ["public", "anon"],
                permissive: true,
                syncStatus: "synced",
            },
            {
                id: "8",
                name: "products_manage_admin",
                command: "ALL",
                using: "auth.role() = 'admin'",
                roles: ["admin"],
                permissive: true,
                syncStatus: "db-only",
            },
        ],
    },
    {
        name: "sessions",
        schema: "auth",
        rlsEnabled: false,
        policies: [],
    },
];

const COMMAND_COLORS: Record<string, { bg: string; text: string }> = {
    SELECT: { bg: "bg-blue-950", text: "text-blue-300" },
    INSERT: { bg: "bg-green-950", text: "text-green-300" },
    UPDATE: { bg: "bg-amber-950", text: "text-amber-300" },
    DELETE: { bg: "bg-red-950", text: "text-red-300" },
    ALL: { bg: "bg-green-950", text: "text-green-300" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
    synced: { bg: "bg-green-900/20", text: "text-green-400", border: "border-green-800/30", label: "Live + Code" },
    unapplied: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", label: "Unapplied" },
    "code-only": { bg: "bg-amber-900/20", text: "text-amber-400", border: "border-amber-800/30", label: "Code Only" },
    "db-only": { bg: "bg-cyan-900/20", text: "text-cyan-400", border: "border-cyan-800/30", label: "DB Only" },
};

// ─── Component ───────────────────────────────────────────
export function RLSEditorDemo() {
    const [tables, setTables] = useState<RLSTable[]>(MOCK_TABLES);
    const [selectedTable, setSelectedTable] = useState<string>("users");
    const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
    const [showNewPolicyForm, setShowNewPolicyForm] = useState(false);
    const [newPolicyName, setNewPolicyName] = useState("");
    const [newPolicyCommand, setNewPolicyCommand] = useState<RLSPolicy["command"]>("SELECT");
    const [newPolicyUsing, setNewPolicyUsing] = useState("");

    const activeTable = tables.find(t => t.name === selectedTable) ?? tables[0];

    const toggleRLS = useCallback((tableName: string) => {
        setTables(prev => prev.map(t =>
            t.name === tableName ? { ...t, rlsEnabled: !t.rlsEnabled } : t
        ));
    }, []);

    const deletePolicy = useCallback((tableId: string, policyId: string) => {
        setTables(prev => prev.map(t =>
            t.name === tableId ? { ...t, policies: t.policies.filter(p => p.id !== policyId) } : t
        ));
    }, []);

    const addPolicy = useCallback(() => {
        if (!newPolicyName.trim() || !newPolicyUsing.trim()) return;
        const newPolicy: RLSPolicy = {
            id: String(Date.now()),
            name: newPolicyName.trim(),
            command: newPolicyCommand,
            using: newPolicyUsing.trim(),
            roles: ["public"],
            permissive: true,
            syncStatus: "unapplied",
        };
        setTables(prev => prev.map(t =>
            t.name === selectedTable ? { ...t, policies: [...t.policies, newPolicy] } : t
        ));
        setNewPolicyName("");
        setNewPolicyUsing("");
        setShowNewPolicyForm(false);
    }, [newPolicyName, newPolicyCommand, newPolicyUsing, selectedTable]);

    return (
        <div className="flex h-[520px] w-full rounded-xl overflow-hidden ring-1 ring-surface-700 bg-surface-950 shadow-2xl text-surface-300 text-sm">
            {/* ── Sidebar ── */}
            <div className="w-[180px] border-r border-surface-800/40 flex flex-col shrink-0">
                <div className="px-3 py-2.5 border-b border-surface-800/40 bg-surface-900/40 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-surface-500">Tables</span>
                    <svg className="h-3 w-3 text-surface-600 cursor-pointer hover:text-surface-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                    {/* Group by schema */}
                    {["public", "auth"].map(schema => (
                        <div key={schema}>
                            <div className="text-[10px] font-semibold text-surface-500 px-1.5 py-1 tracking-wider">▾ {schema}</div>
                            {tables.filter(t => t.schema === schema).map(table => (
                                <button
                                    key={table.name}
                                    onClick={() => setSelectedTable(table.name)}
                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs w-full text-left transition-colors ${
                                        selectedTable === table.name
                                            ? "bg-primary/10 text-primary"
                                            : "text-surface-400 hover:bg-surface-800/40"
                                    }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        table.rlsEnabled ? "bg-green-500" : "bg-orange-400 opacity-50"
                                    }`} />
                                    <span className="truncate flex-1 font-mono text-[11px]">{table.name}</span>
                                    <span className="text-[10px] opacity-40">{table.policies.length}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Main Panel ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Table header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-800/40 bg-surface-900/30 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-surface-300">{activeTable.schema}.{activeTable.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${
                            activeTable.rlsEnabled
                                ? "bg-green-900/30 text-green-400 border-green-800/40"
                                : "bg-orange-900/30 text-orange-400 border-orange-800/40"
                        }`}>
                            RLS {activeTable.rlsEnabled ? "ENABLED" : "DISABLED"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => toggleRLS(activeTable.name)}
                            className="text-[10px] px-2 py-1 rounded-md bg-surface-800/60 text-surface-500 hover:text-surface-300 cursor-pointer transition-colors"
                        >
                            {activeTable.rlsEnabled ? "Disable RLS" : "Enable RLS"}
                        </button>
                        <button
                            onClick={() => setShowNewPolicyForm(true)}
                            className="text-[10px] px-2 py-1 rounded-md bg-primary/20 text-primary font-semibold cursor-pointer hover:bg-primary/30 transition-colors"
                        >
                            + Create Policy
                        </button>
                    </div>
                </div>

                {/* Policies list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-900/20">
                    {!activeTable.rlsEnabled ? (
                        <div className="flex items-center justify-center h-full text-surface-600">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                <p className="text-xs mb-3">RLS is disabled for this table</p>
                                <button
                                    onClick={() => toggleRLS(activeTable.name)}
                                    className="px-3 py-1.5 rounded-md bg-primary/20 text-primary text-[11px] font-semibold hover:bg-primary/30 transition-colors"
                                >
                                    Enable RLS
                                </button>
                            </div>
                        </div>
                    ) : activeTable.policies.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-surface-600">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                <p className="text-xs mb-1">No policies defined</p>
                                <p className="text-[10px] text-surface-600 mb-3">All access is denied by default</p>
                                <button
                                    onClick={() => setShowNewPolicyForm(true)}
                                    className="px-3 py-1.5 rounded-md bg-primary/20 text-primary text-[11px] font-semibold hover:bg-primary/30 transition-colors"
                                >
                                    Create First Policy
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTable.policies.map((policy) => {
                                const cmdStyle = COMMAND_COLORS[policy.command] ?? COMMAND_COLORS.SELECT;
                                const statusStyle = STATUS_STYLES[policy.syncStatus] ?? STATUS_STYLES.synced;

                                return (
                                    <div
                                        key={policy.id}
                                        className={`p-3 rounded-lg border transition-colors ${
                                            policy.syncStatus === "unapplied"
                                                ? "border-primary/20 bg-primary/5"
                                                : "border-surface-800/50 bg-surface-950/80 hover:border-surface-700/60"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-3.5 w-3.5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                                                <span className="text-sm text-white font-medium">{policy.name}</span>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${cmdStyle.bg} ${cmdStyle.text} border ${cmdStyle.bg.replace("bg-", "border-").replace("950", "800/40")}`}>
                                                    {policy.command}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                    {statusStyle.label}
                                                </span>
                                                <button
                                                    onClick={() => setEditingPolicy(editingPolicy === policy.id ? null : policy.id)}
                                                    className="text-surface-500 hover:text-surface-300 transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                </button>
                                                <button
                                                    onClick={() => deletePolicy(activeTable.name, policy.id)}
                                                    className="text-surface-500 hover:text-red-400 transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-800/60 text-[10px]">
                                                <span className="text-surface-500 uppercase font-semibold">Using:</span>
                                                <code className="text-amber-300 font-mono">{policy.using}</code>
                                            </div>
                                            {policy.withCheck && (
                                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-800/60 text-[10px]">
                                                    <span className="text-surface-500 uppercase font-semibold">Check:</span>
                                                    <code className="text-amber-300 font-mono">{policy.withCheck}</code>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-800/60 text-[10px]">
                                                <span className="text-surface-500 uppercase font-semibold">Roles:</span>
                                                <span className="text-surface-300 font-mono">{policy.roles.join(", ")}</span>
                                            </div>
                                        </div>

                                        {/* Expanded edit form */}
                                        {editingPolicy === policy.id && (
                                            <div className="mt-3 pt-3 border-t border-surface-800/40 space-y-2">
                                                <div>
                                                    <label className="text-[10px] text-surface-500 uppercase font-semibold block mb-1">USING Expression</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-2 py-1.5 rounded bg-surface-800/60 border border-surface-700/40 text-[11px] font-mono text-amber-300 outline-none focus:border-primary transition-colors"
                                                        defaultValue={policy.using}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-surface-500 uppercase font-semibold block mb-1">WITH CHECK Expression</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-2 py-1.5 rounded bg-surface-800/60 border border-surface-700/40 text-[11px] font-mono text-amber-300 outline-none focus:border-primary transition-colors"
                                                        defaultValue={policy.withCheck ?? ""}
                                                        placeholder="Optional"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="px-2.5 py-1 rounded bg-primary/20 text-primary text-[10px] font-semibold hover:bg-primary/30 transition-colors">
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingPolicy(null)}
                                                        className="px-2.5 py-1 rounded bg-surface-800/60 text-surface-400 text-[10px] font-semibold hover:text-surface-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* New policy form */}
                            {showNewPolicyForm && (
                                <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                                        <span className="text-sm text-white font-medium">New Policy</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-surface-500 uppercase font-semibold block mb-1">Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1.5 rounded bg-surface-800/60 border border-surface-700/40 text-[11px] font-mono text-surface-300 outline-none focus:border-primary transition-colors"
                                                value={newPolicyName}
                                                onChange={(e) => setNewPolicyName(e.target.value)}
                                                placeholder="policy_name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-surface-500 uppercase font-semibold block mb-1">Command</label>
                                            <select
                                                className="w-full px-2 py-1.5 rounded bg-surface-800/60 border border-surface-700/40 text-[11px] font-mono text-surface-300 outline-none focus:border-primary transition-colors"
                                                value={newPolicyCommand}
                                                onChange={(e) => setNewPolicyCommand(e.target.value as RLSPolicy["command"])}
                                            >
                                                <option value="SELECT">SELECT</option>
                                                <option value="INSERT">INSERT</option>
                                                <option value="UPDATE">UPDATE</option>
                                                <option value="DELETE">DELETE</option>
                                                <option value="ALL">ALL</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-surface-500 uppercase font-semibold block mb-1">USING Expression</label>
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1.5 rounded bg-surface-800/60 border border-surface-700/40 text-[11px] font-mono text-amber-300 outline-none focus:border-primary transition-colors"
                                            value={newPolicyUsing}
                                            onChange={(e) => setNewPolicyUsing(e.target.value)}
                                            placeholder="auth.uid() = user_id"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={addPolicy}
                                            className="px-2.5 py-1 rounded bg-primary text-white text-[10px] font-semibold hover:bg-primary/80 transition-colors"
                                        >
                                            Create Policy
                                        </button>
                                        <button
                                            onClick={() => setShowNewPolicyForm(false)}
                                            className="px-2.5 py-1 rounded bg-surface-800/60 text-surface-400 text-[10px] font-semibold hover:text-surface-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
