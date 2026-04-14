import { EntityCollection } from "@rebasepro/types";
import React, { useState, useEffect } from "react";
import {
    Button, IconButton, Typography, cls, defaultBorderMixin, Chip, KeyIcon, DeleteIcon,
    Paper, Container, Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Select, SelectItem, MultiSelect, MultiSelectItem
} from "@rebasepro/ui";
import { useFormex } from "@rebasepro/formex";
import { useRebaseContext } from "@rebasepro/core";

/** Postgres RLS policy shape — defined inline to avoid depending on @rebasepro/studio */
export interface PostgresPolicy {
    policyname: string;
    tablename: string;
    permissive: "PERMISSIVE" | "RESTRICTIVE";
    roles: string[];
    cmd: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
    qual: string | null;
    with_check: string | null;
    status?: "live" | "code_only" | "both";
}

interface SecurityRule {
    name: string;
    operation?: string;
    mode?: string;
    using?: string;
    withCheck?: string;
    roles?: string[];
}

type CollectionWithSecurity = EntityCollection & {
    securityRules?: SecurityRule[];
    id?: string;
    table?: string;
    alias?: string;
};

export function CollectionRLSTab() {
    const { values, setFieldValue } = useFormex<CollectionWithSecurity>();
    const [editingPolicy, setEditingPolicy] = useState<PostgresPolicy | "new" | null>(null);

    const rules: SecurityRule[] = values.securityRules || [];

    const { databaseAdmin } = useRebaseContext();
    const [dbPolicies, setDbPolicies] = useState<PostgresPolicy[]>([]);
    const [isLoadingDb, setIsLoadingDb] = useState(false);

    useEffect(() => {
        const fetchLivePolicies = async () => {
            const tableName = values.id || values.table || values.alias;
            if (!tableName || !databaseAdmin?.executeSql) return;

            setIsLoadingDb(true);
            try {
                const sql = `
                    SELECT policyname, permissive, roles, cmd, qual, with_check
                    FROM pg_policies
                    WHERE tablename = '${tableName}' AND schemaname NOT IN ('information_schema', 'pg_catalog');
                `;
                const result = await databaseAdmin.executeSql(sql);
                const extractRows = (res: unknown): Record<string, unknown>[] => {
                    if (res && typeof res === "object" && "rows" in res && Array.isArray((res as { rows: Record<string, unknown>[] }).rows)) {
                        return (res as { rows: Record<string, unknown>[] }).rows;
                    }
                    if (Array.isArray(res)) return res as Record<string, unknown>[];
                    return [];
                };
                const pRows = extractRows(result);
                const policies: PostgresPolicy[] = pRows.map((p: any) => {
                    let parsedRoles: string[] = [];
                    const r = p.roles || p.ROLES;
                    if (Array.isArray(r)) {
                        parsedRoles = r as string[];
                    } else if (typeof r === "string") {
                        parsedRoles = r.replace(/^{|}$/g, "").split(",").map((s: string) => s.trim());
                    }
                    return {
                        policyname: (p.policyname || p.POLICYNAME || "") as string,
                        tablename: tableName,
                        permissive: (p.permissive || p.PERMISSIVE || "PERMISSIVE") as "PERMISSIVE" | "RESTRICTIVE",
                        roles: parsedRoles,
                        cmd: (p.cmd || p.CMD || "ALL") as "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL",
                        qual: (p.qual || p.QUAL || null) as string | null,
                        with_check: (p.with_check || p.WITH_CHECK || null) as string | null,
                    };
                });
                setDbPolicies(policies);
            } catch (e) {
                console.error("Failed to fetch DB policies", e);
            } finally {
                setIsLoadingDb(false);
            }
        };
        fetchLivePolicies();
    }, [databaseAdmin, values.id, values.table, values.alias]);

    const unmappedPolicies = dbPolicies.filter(dp => !rules.some(r => r.name === dp.policyname));

    const handleSave = async (newPolicy: Partial<PostgresPolicy>) => {
        const rule: SecurityRule = {
            name: newPolicy.policyname ?? "",
            operation: newPolicy.cmd?.toLowerCase(),
            mode: newPolicy.permissive?.toLowerCase(),
            using: newPolicy.qual || undefined,
            withCheck: newPolicy.with_check || undefined,
            roles: newPolicy.roles
        };

        let newRules;
        if (editingPolicy === "new") {
            newRules = [...rules, rule];
        } else {
            newRules = rules.map((r: SecurityRule) => r.name === (editingPolicy as PostgresPolicy).policyname ? rule : r);
        }
        setFieldValue("securityRules", newRules);
        setEditingPolicy(null);
    };



    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>
                <div className="w-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <Typography variant="h5">Row Level Security</Typography>
                    <Button variant="filled" color="neutral" onClick={() => setEditingPolicy("new")}>
                        CREATE POLICY
                    </Button>
                </div>

                {rules.length === 0 ? (
                    <div className="flex-grow flex items-center justify-center text-text-disabled py-12">
                        <Typography variant="body2">No RLS policies defined for this collection.</Typography>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {rules.map((rule: SecurityRule) => (
                            <Paper key={rule.name} 
                                className={"p-4 border border-transparent hover:border-surface-200 dark:hover:border-surface-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors bg-white dark:bg-surface-950 shadow-sm"}>
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <KeyIcon size="small" className="text-text-disabled dark:text-text-disabled-dark shrink-0" />
                                        <Typography variant="subtitle2" className="truncate">{rule.name}</Typography>
                                    </div>
                                    <div className="flex gap-2 text-xs pl-6 overflow-x-auto hide-scrollbar">
                                        <Chip size="small" className="bg-surface-100 dark:bg-surface-800 text-text-secondary border-none">Action: {rule.operation || "ALL"}</Chip>
                                        <Chip size="small" className="bg-surface-100 dark:bg-surface-800 text-text-secondary border-none">Roles: {Array.isArray(rule.roles) ? rule.roles.join(", ") : rule.roles}</Chip>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                    <Button size="small" variant="text" onClick={() => setEditingPolicy({
                                        policyname: rule.name,
                                        tablename: values.id || values.table || values.alias || "your_table",
                                        permissive: (rule.mode || "permissive").toUpperCase() as PostgresPolicy["permissive"],
                                        cmd: (rule.operation || "ALL").toUpperCase() as PostgresPolicy["cmd"],
                                        roles: rule.roles || ["public"],
                                        qual: rule.using || null,
                                        with_check: rule.withCheck || null
                                    })}>
                                        EDIT
                                    </Button>
                                    <IconButton size="small" onClick={() => {
                                        setFieldValue("securityRules", rules.filter((r: SecurityRule) => r.name !== rule.name));
                                    }}>
                                        <DeleteIcon size="small" className="text-text-secondary dark:text-text-secondary-dark hover:text-red-500 dark:hover:text-red-500 transition-colors" />
                                    </IconButton>
                                </div>
                            </Paper>
                        ))}
                    </div>
                )}
                
                {isLoadingDb && unmappedPolicies.length === 0 && (
                    <div className="flex justify-center mt-8">
                        <CircularProgress size="small" />
                    </div>
                )}

                {!isLoadingDb && unmappedPolicies.length > 0 && (
                    <div className="mt-12 flex flex-col gap-4">
                        <Typography variant="h6" className="text-text-secondary">Unmapped Database Policies</Typography>
                        <Typography variant="body2" className="text-text-secondary opacity-80 -mt-2">
                            These policies exist in your Postgres database but are not mapped to this collection's codebase configuration.
                        </Typography>
                        <div className="flex flex-col gap-3">
                            {unmappedPolicies.map(dp => (
                                <Paper key={dp.policyname} 
                                    className={"p-4 border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"}>
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <KeyIcon size="small" className="text-orange-500 shrink-0" />
                                            <Typography variant="subtitle2" className="truncate">{dp.policyname}</Typography>
                                            <Tooltip title="This policy is live in the database but missing from your codebase schema.">
                                                <div className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-orange-500/10 text-orange-600 border border-orange-500/20 shrink-0">
                                                    DB Only
                                                </div>
                                            </Tooltip>
                                        </div>
                                        <div className="flex gap-2 text-xs pl-6 overflow-x-auto hide-scrollbar">
                                            <Chip size="small" className="bg-white dark:bg-surface-900 text-text-secondary border-none">Action: {dp.cmd || "ALL"}</Chip>
                                            <Chip size="small" className="bg-white dark:bg-surface-900 text-text-secondary border-none">Roles: {Array.isArray(dp.roles) ? dp.roles.join(", ") : dp.roles}</Chip>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                        <Button size="small" variant="outlined" color="primary" onClick={() => {
                                             const rule: SecurityRule = {
                                                name: dp.policyname,
                                                operation: dp.cmd?.toLowerCase(),
                                                mode: dp.permissive?.toLowerCase(),
                                                using: dp.qual || undefined,
                                                withCheck: dp.with_check || undefined,
                                                roles: dp.roles
                                            };
                                            setFieldValue("securityRules", [...rules, rule]);
                                        }}>
                                            Import to codebase
                                        </Button>
                                    </div>
                                </Paper>
                            ))}
                        </div>
                    </div>
                )}
                </div>
                <Dialog open={!!editingPolicy} onOpenChange={(open) => !open && setEditingPolicy(null)} maxWidth="4xl">
                    {editingPolicy && (
                        <InlinePolicyEditor
                            policy={editingPolicy === "new" ? undefined : editingPolicy}
                            table={values.id || values.table || values.alias || "your_table"}
                            onSave={handleSave}
                            onCancel={() => setEditingPolicy(null)}
                        />
                    )}
                </Dialog>
            </Container>
        </div>
    );
}

// ─── Inline Policy Editor (no Monaco dependency) ────────────────────

type PolicyCommand = "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE";
const COMMAND_OPTIONS: PolicyCommand[] = ["ALL", "SELECT", "INSERT", "UPDATE", "DELETE"];
const ROLE_OPTIONS = ["public", "authenticated", "anon", "admin"];

function InlinePolicyEditor({
    policy,
    table,
    onSave,
    onCancel
}: {
    policy?: PostgresPolicy;
    table: string;
    onSave: (policyData: Partial<PostgresPolicy>) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(policy?.policyname || "");
    const [behavior, setBehavior] = useState<"PERMISSIVE" | "RESTRICTIVE">(policy?.permissive || "PERMISSIVE");
    const [command, setCommand] = useState<PolicyCommand>((policy?.cmd as PolicyCommand) || "ALL");
    const [roles, setRoles] = useState<string[]>(
        policy?.roles ? (Array.isArray(policy.roles) ? policy.roles : [policy.roles]) : ["public"]
    );
    const [usingExpr, setUsingExpr] = useState(policy?.qual || "");
    const [checkExpr, setCheckExpr] = useState(policy?.with_check || "");

    const showCheck = command === "ALL" || command === "INSERT" || command === "UPDATE";

    return (
        <>
            <DialogTitle variant="h6">
                {policy ? "Edit Policy" : "Create Policy"}
                <div className="text-sm font-normal text-text-secondary dark:text-text-secondary-dark tracking-wide mt-1">
                    Define RLS rules for <span className="font-mono text-primary bg-primary-bg dark:bg-primary-bg-dark px-1 py-0.5 rounded">public.{table}</span>
                </div>
            </DialogTitle>
            <DialogContent className="p-4 md:p-6 border-t dark:border-surface-800 bg-surface-50 dark:bg-surface-950" includeMargin={false}>
                <Paper className={cls("p-4 md:p-6 flex flex-col gap-6 bg-white dark:bg-surface-900 border-none sm:border-solid rounded-none sm:rounded-xl", defaultBorderMixin)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">Policy Name</Typography>
                            <TextField value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g. allow_read_all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">Behavior</Typography>
                            <Select value={behavior} onValueChange={(val: string) => setBehavior(val as any)} position="item-aligned">
                                <SelectItem value="PERMISSIVE">Permissive</SelectItem>
                                <SelectItem value="RESTRICTIVE">Restrictive</SelectItem>
                            </Select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">Command</Typography>
                        <div className="flex flex-wrap gap-1.5">
                            {COMMAND_OPTIONS.map(cmd => (
                                <Button key={cmd} size="small" variant={command === cmd ? "filled" : "text"} color="neutral" onClick={() => setCommand(cmd)}>
                                    {cmd}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">Target Roles</Typography>
                        <MultiSelect size="small" value={roles} onValueChange={setRoles} placeholder="Select roles">
                            {ROLE_OPTIONS.map(r => <MultiSelectItem key={r} value={r}>{r}</MultiSelectItem>)}
                        </MultiSelect>
                    </div>
                    {command !== "INSERT" && (
                        <div className="flex flex-col gap-1.5">
                            <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">USING expression</Typography>
                            <TextField value={usingExpr} onChange={(e: any) => setUsingExpr(e.target.value)} placeholder="e.g. auth.uid() = user_id" />
                        </div>
                    )}
                    {showCheck && (
                        <div className="flex flex-col gap-1.5">
                            <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">WITH CHECK expression</Typography>
                            <TextField value={checkExpr} onChange={(e: any) => setCheckExpr(e.target.value)} placeholder="e.g. auth.uid() = user_id" />
                        </div>
                    )}
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button size="small" variant="text" color="neutral" onClick={onCancel}>Cancel</Button>
                <Button size="small" variant="filled" color="primary" disabled={!name}
                    onClick={() => onSave({ policyname: name, permissive: behavior, cmd: command, roles, qual: usingExpr, with_check: showCheck ? checkExpr : null })}
                >Save</Button>
            </DialogActions>
        </>
    );
}
