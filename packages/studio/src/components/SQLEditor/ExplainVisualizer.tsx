import React, { useState } from "react";
import { Typography, cls, defaultBorderMixin, Collapse } from "@firecms/ui";

export interface ExplainPlanNode {
    "Node Type": string;
    "Relation Name"?: string;
    "Alias"?: string;
    "Startup Cost": number;
    "Total Cost": number;
    "Plan Rows": number;
    "Plan Width": number;
    "Actual Startup Time"?: number;
    "Actual Total Time"?: number;
    "Actual Rows"?: number;
    "Actual Loops"?: number;
    "Filter"?: string;
    "Index Cond"?: string;
    "Hash Cond"?: string;
    "Plans"?: ExplainPlanNode[];
    [key: string]: any;
}

export interface ExplainVisualizerProps {
    plan: ExplainPlanNode;
    isRoot?: boolean;
}

export const ExplainVisualizer: React.FC<ExplainVisualizerProps> = ({ plan, isRoot = true }) => {
    const [expanded, setExpanded] = useState(true);

    const hasChildren = plan.Plans && plan.Plans.length > 0;

    // Determine color based on cost
    const cost = plan["Total Cost"];
    let costColor = "text-green-500 dark:text-green-400";
    if (cost > 1000) costColor = "text-red-500 dark:text-red-400";
    else if (cost > 100) costColor = "text-orange-500 dark:text-orange-400";

    return (
        <div className={cls("flex flex-col", isRoot ? "p-4" : "pl-6 mt-2 relative")}>
            {/* Tree branch line */}
            {!isRoot && (
                <div className="absolute left-2.5 top-0 bottom-0 w-px bg-surface-200 dark:bg-surface-800 -z-10"></div>
            )}
            {!isRoot && (
                <div className="absolute left-2.5 top-5 w-3 h-px bg-surface-200 dark:bg-surface-800 -z-10"></div>
            )}

            <div className={cls("border rounded-md bg-white dark:bg-surface-900 text-text-primary dark:text-text-primary-dark shadow-xs relative z-10 w-[420px] max-w-full", defaultBorderMixin)}>
                <div
                    className={cls("px-4 py-3 flex justify-between items-center cursor-pointer select-none")}
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex items-center space-x-2">
                        {hasChildren ? (
                            <svg className={cls("w-4 h-4 text-text-secondary transition-transform", !expanded ? "-rotate-90" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        ) : (
                            <div className="w-4 h-4"></div>
                        )}

                        <Typography variant="body1" className="font-semibold flex items-center">
                            {plan["Node Type"]}
                        </Typography>

                        {plan["Relation Name"] && (
                            <span className="font-mono text-[11px] text-text-secondary dark:text-text-secondary-dark px-2 py-0.5 rounded bg-surface-200 dark:bg-surface-800 ml-2">
                                on {plan["Relation Name"]} {plan.Alias && plan.Alias !== plan["Relation Name"] ? `(${plan.Alias})` : ""}
                            </span>
                        )}
                    </div>

                    <div className="flex space-x-6 items-center">
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] uppercase text-text-disabled dark:text-text-disabled-dark font-semibold tracking-wide leading-tight mb-0.5">Cost</span>
                            <span className={cls("font-mono font-medium text-[13px] leading-none", costColor)}>{cost.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] uppercase text-text-disabled dark:text-text-disabled-dark font-semibold tracking-wide leading-tight mb-0.5">Rows</span>
                            <span className="font-mono text-[13px] text-text-secondary dark:text-text-secondary-dark leading-none">{plan["Plan Rows"]}</span>
                        </div>
                    </div>
                </div>

                <Collapse in={expanded}>
                    <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-800 text-[13px] flex flex-col gap-2">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <span className="text-text-disabled dark:text-text-disabled-dark">Startup Cost:</span>
                                <span className="font-mono font-medium">{plan["Startup Cost"].toFixed(2)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-text-disabled dark:text-text-disabled-dark">Width:</span>
                                <span className="font-mono font-medium">{plan["Plan Width"]} bytes</span>
                            </div>
                        </div>

                        {plan.Filter && (
                            <div className="mt-1">
                                <span className="text-text-disabled dark:text-text-disabled-dark block mb-1">Filter:</span>
                                <code className="block w-full p-2 bg-surface-50 dark:bg-surface-950 border dark:border-surface-800 rounded font-mono text-[12px] truncate">{plan.Filter}</code>
                            </div>
                        )}
                        {plan["Index Cond"] && (
                            <div className="mt-1">
                                <span className="text-text-disabled dark:text-text-disabled-dark block mb-1">Index Cond:</span>
                                <code className="block w-full p-2 bg-surface-50 dark:bg-surface-950 border dark:border-surface-800 rounded font-mono text-[12px] truncate">{plan["Index Cond"]}</code>
                            </div>
                        )}
                        {plan["Hash Cond"] && (
                            <div className="mt-1">
                                <span className="text-text-disabled dark:text-text-disabled-dark block mb-1">Hash Cond:</span>
                                <code className="block w-full p-2 bg-surface-50 dark:bg-surface-950 border dark:border-surface-800 rounded font-mono text-[12px] truncate">{plan["Hash Cond"]}</code>
                            </div>
                        )}
                    </div>
                </Collapse>
            </div>

            {expanded && hasChildren && (
                <div className="flex flex-col space-y-2 mt-[-4px]">
                    {plan.Plans!.map((childPlan, idx) => (
                        <ExplainVisualizer key={idx} plan={childPlan} isRoot={false} />
                    ))}
                </div>
            )}
        </div>
    );
};
