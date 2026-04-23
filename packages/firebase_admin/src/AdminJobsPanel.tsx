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

/**
 * A small indicator that appears in the Firestore Explorer toolbar when
 * admin jobs are running. Shows a count chip and expands to a popover
 * with details and progress for each active job.
 */
export function AdminJobsPanel({ projectId }: AdminJobsPanelProps) {
    const firestore = useBackendFirestore();
    const activeJobs = useActiveAdminJobs(firestore, projectId);

    if (activeJobs.length === 0) {
        return null;
    }

    const triggerContent = (
        <Chip
            size="small"
            colorScheme="primaryLighter"
            className="cursor-pointer animate-pulse"
        >
            <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <Typography variant="caption">
                    {activeJobs.length} job{activeJobs.length !== 1 ? "s" : ""} running
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

                {activeJobs.map((job) => (
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
                                    width: job.progress.total
                                        ? `${Math.min(100, (job.progress.processed / job.progress.total) * 100)}%`
                                        : undefined,
                                    minWidth: job.progress.processed > 0 ? "6px" : undefined,
                                }}
                            />
                        </div>

                        <Typography variant="caption" color="secondary">
                            {job.progress.message ?? `${job.progress.processed} processed`}
                        </Typography>
                    </div>
                ))}
            </div>
        </Popover>
    );
}
