import React from "react";
import {
    Chip,
    Popover,
    Typography,
    DeleteIcon,
} from "@firecms/ui";
import { useBackendFirestore } from "./api/AdminApiProvider";
import { useActiveAdminJobs } from "./hooks/useActiveAdminJobs";
import { AdminJobState } from "./hooks/useAdminJob";

interface AdminJobsPanelProps {
    projectId: string;
}

function getJobIcon(type: string) {
    switch (type) {
        case "delete_collection":
            return <DeleteIcon size="smallest" />;
        default:
            return null;
    }
}

function getJobLabel(job: AdminJobState): string {
    switch (job.type) {
        case "delete_collection":
            return `Deleting: ${job.params?.collectionPath ?? "collection"}`;
        default:
            return `Job: ${job.type}`;
    }
}

type RetainedJobState = AdminJobState & { _disappearedAt?: number; _lastActive?: number };

/**
 * A small indicator that appears in the Firestore Explorer toolbar when
 * admin jobs are running. Shows a count chip and expands to a popover
 * with details and progress for each active job.
 */
export function AdminJobsPanel({ projectId }: AdminJobsPanelProps) {
    const firestore = useBackendFirestore();
    const activeJobs = useActiveAdminJobs(firestore, projectId);

    const [retainedJobs, setRetainedJobs] = React.useState<RetainedJobState[]>([]);

    React.useEffect(() => {
        setRetainedJobs(prev => {
            const next = [...prev];
            const now = Date.now();

            for (const active of activeJobs) {
                const index = next.findIndex(j => j.id === active.id);
                if (index >= 0) {
                    next[index] = { ...active, _lastActive: now, _disappearedAt: undefined };
                } else {
                    next.push({ ...active, _lastActive: now });
                }
            }

            return next.map(j => {
                if (!activeJobs.find(a => a.id === j.id)) {
                    if (j.status === "running") {
                        return {
                            ...j,
                            status: "completed",
                            progress: {
                                ...j.progress,
                                processed: Math.max(j.progress.processed, j.progress.total || j.progress.processed),
                                message: "Completed",
                            },
                            _disappearedAt: j._disappearedAt || now,
                        };
                    }
                }
                return j;
            });
        });
    }, [activeJobs]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setRetainedJobs(prev => prev.filter(j => {
                if (j._disappearedAt && Date.now() - j._disappearedAt > 5000) {
                    return false;
                }
                return true;
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const jobsToDisplay = retainedJobs;

    if (jobsToDisplay.length === 0) {
        return null;
    }

    const runningCount = jobsToDisplay.filter(j => j.status === "running").length;
    const completedCount = jobsToDisplay.length - runningCount;

    const triggerContent = (
        <Chip
            size="small"
            colorScheme={runningCount > 0 ? "primaryLighter" : "grayLighter"}
            className="cursor-pointer transition-colors"
        >
            <span className="flex items-center gap-1.5">
                {runningCount > 0 ? (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                ) : (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
                <Typography variant="caption">
                    {runningCount > 0
                        ? `${runningCount} job${runningCount !== 1 ? "s" : ""} running`
                        : `${completedCount} job${completedCount !== 1 ? "s" : ""} completed`}
                </Typography>
            </span>
        </Chip>
    );

    return (
        <Popover
            trigger={triggerContent}
        >
            <div className="p-3 min-w-[300px] max-w-[400px] flex flex-col gap-3">
                <Typography variant="subtitle2">
                    Active Jobs
                </Typography>

                {jobsToDisplay.map((job) => (
                    <div key={job.id} className="flex flex-col gap-1.5 p-2 bg-surface-50 dark:bg-surface-800 rounded">
                        <div className="flex items-center gap-2">
                            {getJobIcon(job.type)}
                            <Typography variant="body2" className="flex-1 truncate">
                                {getJobLabel(job)}
                            </Typography>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5">
                            <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: job.progress.total && job.progress.total > 0
                                        ? `${Math.min(100, (job.progress.processed / job.progress.total) * 100)}%`
                                        : "15%",
                                    ...(!job.progress.total && {
                                        animation: "pulse 2s ease-in-out infinite",
                                    }),
                                    minWidth: job.progress.processed > 0 ? "6px" : undefined,
                                }}
                            />
                        </div>

                        <Typography variant="caption" color="secondary">
                            {(() => {
                                if (job.status === "completed") return "Completed";
                                if (job.status === "failed") return "Failed";
                                if (job.progress.total) {
                                    const pct = Math.min(100, Math.round((job.progress.processed / job.progress.total) * 100));
                                    return `Deleted ${job.progress.processed} of ~${job.progress.total} documents (${pct}%)`;
                                }
                                return `Deleted ${job.progress.processed} documents...`;
                            })()}
                        </Typography>
                    </div>
                ))}
            </div>
        </Popover>
    );
}
