import { useEffect, useRef } from "react";

/**
 * How long a project's `firebase_config` may stay pending before we ask the
 * backend for its web app ourselves. It normally arrives 10-15s after the
 * project is created, and the backend polls Google's operation for up to about
 * a minute: asking while that runs could create a second web app.
 */
export const FIREBASE_CONFIG_STALLED_MS = 90_000;

/**
 * `POST /projects` leaves `firebase_config` as "loading" and creates the
 * project's web app in the background. When that creation never finishes (the
 * backend gives up polling Google and leaves it pending) or fails ("error"),
 * nothing asked again: the new-project flow and `/p/{id}` both waited on the
 * config forever.
 *
 * Once it has been pending for {@link FIREBASE_CONFIG_STALLED_MS}, this calls
 * `POST /projects/:id/firebase_webapp` once per project. That endpoint creates
 * the web app, or finds the one that exists, and writes the config the project
 * listener is waiting for.
 */
export function useRetryStalledFirebaseConfig({
                                                  projectId,
                                                  pending,
                                                  createFirebaseWebapp
                                              }: {
    projectId: string;
    /** Whether `firebase_config` is currently "loading" or "error". */
    pending: boolean;
    createFirebaseWebapp?: (projectId: string) => Promise<unknown>;
}) {
    const requestedForRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!pending || !projectId || !createFirebaseWebapp) return;
        if (requestedForRef.current === projectId) return;
        const timeout = setTimeout(() => {
            requestedForRef.current = projectId;
            createFirebaseWebapp(projectId)
                .catch((e) => console.error("Error creating the Firebase web app for a stalled config", e));
        }, FIREBASE_CONFIG_STALLED_MS);
        return () => clearTimeout(timeout);
    }, [pending, projectId, createFirebaseWebapp]);
}
