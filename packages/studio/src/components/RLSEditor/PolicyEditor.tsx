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
    defaultBorderMixin,
    IconButton,
    HelpOutlineIcon,
    Dialog,
    DialogContent,
    DialogActions
} from "@rebasepro/ui";
import { useTranslation } from "@rebasepro/core";
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

    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [helpOpen, setHelpOpen] = useState(false);
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
                <div className="flex items-center gap-3">
                    <div>
                        <Typography variant="subtitle1" className="">
                            {policy ? t("studio_policy_edit") : t("studio_policy_create")}
                        </Typography>
                        <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark mt-1">
                            {t("studio_policy_defining_rules")} <span className="font-mono text-primary bg-primary-bg dark:bg-primary-bg-dark px-1 py-0.5 rounded">{schema}.{table}</span>
                        </Typography>
                    </div>
                    <IconButton size="small" onClick={() => setHelpOpen(true)}>
                        <HelpOutlineIcon size="small" />
                    </IconButton>
                </div>
                <div className="flex gap-2">
                    <Button size="small" variant="text" color="neutral" onClick={onCancel}>
                        {t("studio_policy_cancel")}
                    </Button>
                    <Button size="small" variant="filled" color="primary" onClick={handleSave} disabled={!name}>
                        {t("studio_policy_save")}
                    </Button>
                </div>
            </div>

            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                <Paper className={cls("p-4 md:p-6 flex flex-col gap-6 bg-white dark:bg-surface-900 border-none sm:border-solid rounded-none sm:rounded-xl", defaultBorderMixin)}>

                    {/* Presets - only for new policies */}
                    {!policy && (
                    <div className="flex flex-col gap-1.5 bg-primary/5 dark:bg-primary-bg-dark/20 p-3 sm:p-4 rounded-lg border border-primary/10 dark:border-primary/20">
                        <Typography variant="caption" className="text-primary dark:text-primary-light uppercase tracking-wider">{t("studio_policy_template")}</Typography>
                        <Select
                            size="small"
                            value={selectedPreset}
                            onValueChange={handlePresetChange}
                            position="item-aligned"
                            placeholder={t("studio_policy_select_template")}
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
                            <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">{t("studio_policy_name")}</Typography>
                            <TextField
                                // @ts-ignore
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("studio_policy_name_placeholder")}
                                className="w-full"
                            />
                        </div>

                        {/* Behavior */}
                        <div className="flex flex-col gap-1.5">
                            <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">
                                {t("studio_policy_behavior")} <code className="text-[10px] bg-surface-200 dark:bg-surface-800 text-text-secondary dark:text-text-secondary-dark px-1 py-0.5 rounded ml-1">AS</code>
                            </Typography>
                            <Select
                                value={behavior}
                                onValueChange={(val) => setBehavior(val as "PERMISSIVE" | "RESTRICTIVE")}
                                position="item-aligned"
                            >
                                <SelectItem value="PERMISSIVE">
                                    <div className="flex flex-col text-left">
                                        <span className="">{t("studio_policy_permissive")}</span>
                                        <span className="text-xs text-text-secondary dark:text-text-secondary-dark">{t("studio_policy_permissive_desc")}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="RESTRICTIVE">
                                    <div className="flex flex-col text-left">
                                        <span className="">{t("studio_policy_restrictive")}</span>
                                        <span className="text-xs text-text-secondary dark:text-text-secondary-dark">{t("studio_policy_restrictive_desc")}</span>
                                    </div>
                                </SelectItem>
                            </Select>
                        </div>
                    </div>

                    {/* Command */}
                    <div className="flex flex-col gap-1.5">
                        <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">
                            {t("studio_policy_command")} <code className="text-[10px] bg-surface-200 dark:bg-surface-800 text-text-secondary dark:text-text-secondary-dark px-1 py-0.5 rounded ml-1">FOR</code>
                        </Typography>
                        <div className="flex flex-wrap gap-1.5">
                            {COMMAND_OPTIONS.map(cmd => (
                                <Button
                                    key={cmd}
                                    size="small"
                                    variant={command === cmd ? "filled" : "text"}
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
                            {t("studio_policy_target_roles")} <code className="text-[10px] bg-surface-200 dark:bg-surface-800 text-text-secondary dark:text-text-secondary-dark px-1 py-0.5 rounded ml-1">TO</code>
                        </Typography>
                        <MultiSelect
                            size="small"
                            value={roles}
                            onValueChange={setRoles}
                            placeholder={t("studio_policy_roles_placeholder")}
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
                                <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">{t("studio_policy_using_expr")}</Typography>
                                <Typography variant="caption" className="text-text-secondary opacity-70">{t("studio_policy_using_expr_desc")}</Typography>
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
                                <Typography variant="caption" className="uppercase tracking-wider text-text-secondary">{t("studio_policy_check_expr")}</Typography>
                                <Typography variant="caption" className="text-text-secondary opacity-70">{t("studio_policy_check_expr_desc")}</Typography>
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

            <Dialog open={helpOpen} onOpenChange={setHelpOpen} maxWidth="3xl">
                <DialogContent className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
                    <div>
                        <Typography variant="h5" className="mb-2">{t("studio_policy_help_title")}</Typography>
                        <Typography className="text-text-secondary dark:text-text-secondary-dark">
                            {t("studio_policy_help_intro")}
                        </Typography>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <Paper className={cls("p-4 sm:p-5 flex flex-col gap-1", defaultBorderMixin)}>
                            <Typography variant="subtitle2" className="text-primary dark:text-primary-light font-medium">{t("studio_policy_help_step1_title")}</Typography>
                            <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark">
                                {t("studio_policy_help_step1_desc")}
                            </Typography>
                        </Paper>
                        
                        <Paper className={cls("p-4 sm:p-5 flex flex-col gap-1", defaultBorderMixin)}>
                            <Typography variant="subtitle2" className="text-primary dark:text-primary-light font-medium">{t("studio_policy_help_step2_title")}</Typography>
                            <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark mb-1">
                                {t("studio_policy_help_step2_desc")}
                            </Typography>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary dark:text-text-secondary-dark">
                                <li><strong>public</strong>: {t("studio_policy_help_role_public")}</li>
                                <li><strong>authenticated</strong>: {t("studio_policy_help_role_authenticated")}</li>
                                <li><strong>anon</strong>: {t("studio_policy_help_role_anon")}</li>
                            </ul>
                        </Paper>

                        <Paper className={cls("p-4 sm:p-5 flex flex-col gap-1", defaultBorderMixin)}>
                            <Typography variant="subtitle2" className="text-primary dark:text-primary-light font-medium">{t("studio_policy_help_step3_title")}</Typography>
                            <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark mb-1">
                                {t("studio_policy_help_step3_desc")}
                            </Typography>
                            <div className={cls("bg-surface-100 dark:bg-surface-800 px-3 py-2 rounded-md font-mono text-sm my-2", defaultBorderMixin)}>
                                Example: auth.uid() = user_id
                            </div>
                            <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark">
                                {t("studio_policy_help_step3_example")}
                            </Typography>
                        </Paper>

                        <Paper className={cls("p-4 sm:p-5 flex flex-col gap-1", defaultBorderMixin)}>
                            <Typography variant="subtitle2" className="text-primary dark:text-primary-light font-medium">{t("studio_policy_help_step4_title")}</Typography>
                            <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark mb-1">
                                {t("studio_policy_help_step4_desc")}
                            </Typography>
                            <div className={cls("bg-surface-100 dark:bg-surface-800 px-3 py-2 rounded-md font-mono text-sm my-2", defaultBorderMixin)}>
                                Example: auth.uid() = user_id
                            </div>
                            <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark">
                                {t("studio_policy_help_step4_example")}
                            </Typography>
                        </Paper>

                        <Paper className={cls("p-4 sm:p-5 flex flex-col gap-2 bg-primary/5 dark:bg-primary-bg-dark/10", defaultBorderMixin)}>
                            <Typography variant="subtitle2" className="text-primary dark:text-primary-light font-medium">{t("studio_policy_help_auth_vars_title")}</Typography>
                            <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark">
                                {t("studio_policy_help_auth_vars_desc")}
                            </Typography>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary dark:text-text-secondary-dark font-normal">
                                <li>
                                    <code className="bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded mr-1 whitespace-nowrap">auth.uid()</code>
                                    <span className="block mt-0.5">Returns the current user's ID as text. Example: <code className="bg-surface-100 dark:bg-surface-800 px-1 py-0.5 rounded text-[11px]">auth.uid() = user_id</code></span>
                                </li>
                                <li>
                                    <code className="bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded mr-1 whitespace-nowrap">auth.jwt()</code>
                                    <span className="block mt-0.5">Returns the full JWT payload as JSONB so you can check custom claims. Example: <code className="bg-surface-100 dark:bg-surface-800 px-1 py-0.5 rounded text-[11px]">auth.jwt() -&gt;&gt; 'email' = 'admin@example.com'</code></span>
                                </li>
                                <li>
                                    <code className="bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded mr-1 whitespace-nowrap">auth.roles()</code>
                                    <span className="block mt-0.5">Returns the user's role IDs as a comma-separated string. Best used with: <code className="bg-surface-100 dark:bg-surface-800 px-1 py-0.5 rounded text-[11px]">string_to_array(auth.roles(), ',') @&gt; ARRAY['admin']</code></span>
                                </li>
                            </ul>
                        </Paper>
                    </div>

                    <div className={cls("mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-primary/5 dark:bg-primary-bg-dark/10 p-4 rounded-xl border border-primary/10 dark:border-primary/20", defaultBorderMixin)}>
                        <Typography variant="body2" className="text-primary dark:text-primary-light mb-4 sm:mb-0 max-w-md">
                            {t("studio_policy_help_docs_cta")}
                        </Typography>
                        <Button 
                            component="a" 
                            href="https://www.postgresql.org/docs/current/sql-createpolicy.html" 
                            target="_blank" 
                            variant="outlined" 
                            color="primary" 
                            size="small"
                            className="whitespace-nowrap flex-shrink-0"
                        >
                            {t("studio_policy_help_read_docs")}
                        </Button>
                    </div>
                </DialogContent>
                <DialogActions className="p-4 sm:px-6 sm:pb-6 pt-0 border-t-0">
                    <Button onClick={() => setHelpOpen(false)} variant="filled" color="primary">{t("studio_policy_help_got_it")}</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
};
