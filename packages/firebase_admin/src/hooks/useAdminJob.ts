import { useEffect, useState } from "react";
import { doc, onSnapshot, Firestore } from "@firebase/firestore";

export interface AdminJobState {
    id: string;
    type: string;
    status: "running" | "completed" | "failed";
    progress: {
        processed: number;
        total?: number;
    };
    params: Record<string, any>;
    error?: string;
    createdAt?: any;
}

/**
 * Hook that listens to a single admin job document in real-time via onSnapshot.
 * Returns the current job state, or null if no jobId is provided.
 *
 * The listener auto-unsubscribes when the component unmounts or when the
 * job reaches a terminal state (completed/failed) — you can keep the
 * returned state around for displaying final results.
 */
export function useAdminJob(
    firestore: Firestore | undefined,
    projectId: string,
    jobId: string | null
): AdminJobState | null {
    const [job, setJob] = useState<AdminJobState | null>(null);

    useEffect(() => {
        if (!firestore || !jobId) {
            setJob(null);
            return;
        }

        const jobDoc = doc(firestore, `projects/${projectId}/admin_jobs/${jobId}`);
        const unsub = onSnapshot(jobDoc, (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            setJob({
                id: snap.id,
                type: data.type,
                status: data.status,
                progress: data.progress ?? { processed: 0 },
                params: data.params ?? {},
                error: data.error,
                createdAt: data.createdAt,
            });
        });

        return unsub;
    }, [firestore, projectId, jobId]);

    return job;
}
