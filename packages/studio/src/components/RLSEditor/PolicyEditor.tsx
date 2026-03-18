import React, { useState, useEffect } from "react";
import {
    Button,
    Paper,
    Typography,
    TextField,
    Select,
    SelectItem,
    MultiSelect,
    MultiSelectItem,
    cls,
    defaultBorderMixin
} from "@rebasepro/ui";
import { MonacoEditor } from "../SQLEditor/MonacoEditor";
import { PostgresPolicy } from "./RLSEditor";

export interface PolicyEditorProps {
    policy?: PostgresPolicy;
    schema: string;
    table: string;
    onSave: (policyData: Partial<PostgresPolicy>) => void;
    onCancel: () => void;
}

type PolicyCommand = "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE";
const COMMAND_OPTIONS: PolicyCommand[] = ["ALL", "SELECT", "INSERT", "UPDATE", "DELETE"];
const ROLE_OPTIONS = ["public", "authenticated", "anon", "admin"];

interface PolicyPreset {
    id: string;
    label: string;
    description: string;
    policyname: string;
    cmd: PolicyCommand;
    permissive: "PERMISSIVE" | "RESTRICTIVE";
    roles: string[];
    qual: string;
    with_check: string;
}

const POLICY_PRESETS: PolicyPreset[] = [
    {
        id: "public_read",
        label: "Enable read access to everyone",
        description: "Anyone can read data, regardless of authentication status.",
        policyname: "Enable read access for all users",
        cmd: "SELECT",
        permissive: "PERMISSIVE",
        roles: ["public"],
        qual: "true",
        with_check: ""
    },
    {
        id: "auth_read",
        label: "Enable read access for authenticated users only",
        description: "Only logged-in users are allowed to read data.",
        policyname: "Enable read access for authenticated users",
        cmd: "SELECT",
        permissive: "PERMISSIVE",
        roles: ["authenticated"],
        qual: "true",
        with_check: ""
    },
    {
        id: "auth_insert",
        label: "Enable insert for authenticated users only",
        description: "Only logged-in users are allowed to insert new data.",
        policyname: "Enable insert for authenticated users only",
        cmd: "INSERT",
        permissive: "PERMISSIVE",
        roles: ["authenticated"],
        qual: "",
        with_check: "true"
    },
    {
        id: "user_select_own",
        label: "Users can read their own rows",
        description: "Users can only read rows where the user_id matches their auth.uid()",
        policyname: "Users can select their own data",
        cmd: "SELECT",
        permissive: "PERMISSIVE",
        roles: ["authenticated"],
        qual: "auth.uid() = user_id",
        with_check: ""
    },
    {
        id: "user_update_own",
        label: "Users can update their own rows",
        description: "Users can only update rows where the user_id matches their auth.uid()",
        policyname: "Users can update their own data",
        cmd: "UPDATE",
        permissive: "PERMISSIVE",
        roles: ["authenticated"],
        qual: "auth.uid() = user_id",
        with_check: "auth.uid() = user_id"
    },
    {
        id: "user_delete_own",
        label: "Users can delete their own rows",
        description: "Users can only delete rows where the user_id matches their auth.uid()",
        policyname: "Users can delete their own data",
        cmd: "DELETE",
        permissive: "PERMISSIVE",
        roles: ["authenticated"],
        qual: "auth.uid() = user_id",
        with_check: ""
    }
];

export const PolicyEditor = ({
    policy,
    schema,
    table,
    onSave,
    onCancel
}: PolicyEditorProps) => {

    const [name, setName] = useState("");
    const [behavior, setBehavior] = useState<"PERMISSIVE" | "RESTRICTIVE">("PERMISSIVE");
    const [command, setCommand] = useState<PolicyCommand>("ALL");
    const [roles, setRoles] = useState<string[]>(["public"]);
    const [usingExpr, setUsingExpr] = useState<string>("");
    const [checkExpr, setCheckExpr] = useState<string>("");

    const [selectedPreset, setSelectedPreset] = useState<string>("");

    useEffect(() => {
        if (policy) {
            setName(policy.policyname || "");
            setBehavior(policy.permissive || "PERMISSIVE");
            setCommand((policy.cmd as PolicyCommand) || "ALL");

            const initialRoles = policy.roles
                ? (Array.isArray(policy.roles) ? policy.roles : [policy.roles])
                : ["public"];
            setRoles(initialRoles as string[]);

            setUsingExpr(policy.qual || "");
            setCheckExpr(policy.with_check || "");
        } else {
            setName("");
            setBehavior("PERMISSIVE");
            setCommand("ALL");
            setRoles(["public"]);
            setUsingExpr("");
            setCheckExpr("");
            setSelectedPreset("");
        }
    }, [policy]);

    const handlePresetChange = (presetId: string) => {
        const preset = POLICY_PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        setSelectedPreset(presetId);
        setName(preset.policyname);
        setBehavior(preset.permissive);
        setCommand(preset.cmd);
        setRoles(preset.roles);
        setUsingExpr(preset.qual);
        setCheckExpr(preset.with_check);
    };

    const showCheck = command === "ALL" || command === "INSERT" || command === "UPDATE";

    const handleSave = () => {
        onSave({
            policyname: name,
            permissive: behavior,
            cmd: command,
            roles: roles,
            qual: usingExpr,
            with_check: showCheck ? checkExpr : null
        });
    };

    return (
        <div className="flex-grow flex flex-col h-full bg-surface-50 dark:bg-surface-950 text-text-primary dark:text-text-primary-dark">
            {/* Header */}
            <div className={cls("p-4 bg-surface-50 dark:bg-surface-950 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-10", defaultBorderMixin)}>
                <div>
                    <Typography variant="subtitle1" className="">
                        {policy ? "Edit Policy" : "Create New Policy"}
                    </Typography>
                    <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark mt-1">
                        Defining access rules for <span className="font-mono text-primary bg-primary-bg dark:bg-primary-bg-dark px-1 py-0.5 rounded">{schema}.{table}</span>
                    </Typography>
                </div>
                <div className="flex gap-2">
                    <Button size="small" variant="outlined" color="neutral" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button size="small" variant="filled" color="primary" onClick={handleSave} disabled={!name}>
                        Save Policy
                    </Button>
                </div>
            </div>

            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                <Paper className={cls("p-4 md:p-6 flex flex-col gap-6 bg-white dark:bg-surface-900 border-none sm:border-solid rounded-none sm:rounded-xl", defaultBorderMixin)}>

                    {/* Presets - only for new policies */}
                    {!policy && (
                    <div className="flex flex-col gap-1.5 bg-primary/5 dark:bg-primary-bg-dark/20 p-3 sm:p-4 rounded-lg border border-primary/10 dark:border-primary/20">
                        <Typography variant="caption" className="text-primary dark:text-primary-light uppercase tracking-wider font-semibold">Start from a template (Optional)</Typography>
                        <Select
                            size="small"
                            value={selectedPreset}
                            onValueChange={handlePresetChange}
                            position="item-aligned"
                            placeholder="Select a template..."
                            className="bg-white dark:bg-surface-950"
                        >
                            {POLICY_PRESETS.map((preset) => (
                                <SelectItem key={preset.id} value={preset.id}>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm">{preset.label}</span>
                                        <span className="text-xs text-text-secondary dark:text-text-secondary-dark">{preset.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Policy Name */}
                        <div className="flex flex-col gap-1.5">
                            <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">Policy Name</Typography>
                            <TextField
                                // @ts-ignore
                                size="small"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Give your policy a descriptive name"
                                className="w-full"
                            />
                        </div>

                        {/* Behavior */}
                        <div className="flex flex-col gap-1.5">
                            <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">
                                Policy Behavior <code className="text-[10px] bg-surface-200 dark:bg-surface-800 text-text-secondary dark:text-text-secondary-dark px-1 py-0.5 rounded ml-1">AS</code>
                            </Typography>
                            <Select
                                size="small"
                                value={behavior}
                                onValueChange={(val) => setBehavior(val as any)}
                                position="item-aligned"
                            >
                                <SelectItem value="PERMISSIVE">
                                    <div className="flex flex-col text-left">
                                        <span className="">Permissive</span>
                                        <span className="text-xs text-text-secondary dark:text-text-secondary-dark">Combined using "OR"</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="RESTRICTIVE">
                                    <div className="flex flex-col text-left">
                                        <span className="">Restrictive</span>
                                        <span className="text-xs text-text-secondary dark:text-text-secondary-dark">Combined using "AND"</span>
                                    </div>
                                </SelectItem>
                            </Select>
                        </div>
                    </div>

                    {/* Command */}
                    <div className="flex flex-col gap-1.5">
                        <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">
                            Policy Command <code className="text-[10px] bg-surface-200 dark:bg-surface-800 text-text-secondary dark:text-text-secondary-dark px-1 py-0.5 rounded ml-1">FOR</code>
                        </Typography>
                        <div className="flex flex-wrap gap-1.5">
                            {COMMAND_OPTIONS.map(cmd => (
                                <Button
                                    key={cmd}
                                    size="small"
                                    variant={command === cmd ? "filled" : "outlined"}
                                    color="neutral"
                                    onClick={() => setCommand(cmd)}
                                    className="min-w-[80px]"
                                >
                                    {cmd}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="flex flex-col gap-1.5">
                        <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">
                            Target Roles <code className="text-[10px] bg-surface-200 dark:bg-surface-800 text-text-secondary dark:text-text-secondary-dark px-1 py-0.5 rounded ml-1">TO</code>
                        </Typography>
                        <MultiSelect
                            size="small"
                            value={roles}
                            onValueChange={setRoles}
                            placeholder="Select roles (defaults to public)"
                        >
                            {ROLE_OPTIONS.map(role => (
                                <MultiSelectItem key={role} value={role}>
                                    {role}
                                </MultiSelectItem>
                            ))}
                        </MultiSelect>
                    </div>

                </Paper>

                <div className="mt-8 flex flex-col gap-4">
                    {/* USING Expression */}
                    {command !== "INSERT" && (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex flex-col gap-0.5">
                                <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">USING expression</Typography>
                                <Typography variant="caption" className="text-text-secondary opacity-70">Applies to existing rows (SELECT, UPDATE, DELETE)</Typography>
                            </div>
                            <div className={cls("h-32 border rounded-md overflow-hidden bg-white dark:bg-[#1e1e1e]", defaultBorderMixin)}>
                                <MonacoEditor
                                    value={usingExpr}
                                    onChange={(v) => setUsingExpr(v || "")}
                                    readOnly={false}
                                    autoFocus={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* WITH CHECK Expression */}
                    {showCheck && (
                        <div className="flex flex-col gap-1.5 mt-2">
                            <div className="flex flex-col gap-0.5">
                                <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">WITH CHECK expression</Typography>
                                <Typography variant="caption" className="text-text-secondary opacity-70">Applies to new or modified rows (INSERT, UPDATE)</Typography>
                            </div>
                            <div className={cls("h-32 border rounded-md overflow-hidden bg-white dark:bg-[#1e1e1e]", defaultBorderMixin)}>
                                <MonacoEditor
                                    value={checkExpr}
                                    onChange={(v) => setCheckExpr(v || "")}
                                    readOnly={false}
                                    autoFocus={command === "INSERT"}
                                />
                            </div>
                        </div>
                    )}
                </div>

                </div>
            </div >
        </div >
    );
};
