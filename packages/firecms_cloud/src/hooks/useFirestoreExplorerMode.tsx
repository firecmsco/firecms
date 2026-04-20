import { matchRoutes, useLocation } from "react-router-dom";

export const useFirestoreExplorerMode = (): boolean => {
    const location = useLocation()
    const res = matchRoutes([{ path: "/p/:projectId/firestore" }], location);
    if (!res) return false;
    return res.length > 0;
}
