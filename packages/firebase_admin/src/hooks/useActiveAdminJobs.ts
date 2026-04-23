import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy, Firestore } from "@firebase/firestore";
import { AdminJobState } from "./useAdminJob";

/**
 * Hook that listens to all running admin jobs for a project in real-time.
 * Returns an array of active jobs, updated instantly via onSnapshot.
 */
export function useActiveAdminJobs(
    firestore: Firestore | undefined,
    projectId: string
): AdminJobState[] {
    const [jobs, setJobs] = useState<AdminJobState[]>([]);

    useEffect(() => {
        if (!firestore || !projectId) {
            setJobs([]);
            return;
        }

        const q = query(
            collection(firestore, `projects/${projectId}/admin_jobs`),
            where("status", "==", "running"),
        );

        return onSnapshot(q, (snap) => {
            setJobs(snap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    type: data.type,
                    status: data.status,
                    progress: data.progress ?? { processed: 0 },
                    params: data.params ?? {},
                    error: data.error,
                    createdAt: data.createdAt,
                } as AdminJobState;
            }));
        }, (error) => {
            console.error("Error listening to admin jobs", error);
            setJobs([]);
        });
    }, [firestore, projectId]);

    return jobs;
}
