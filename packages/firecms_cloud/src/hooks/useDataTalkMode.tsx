import { matchRoutes, useLocation } from "react-router-dom";

export const useDataTalkMode = (): boolean => {
    const location = useLocation()
    const res = matchRoutes([{ path: "/p/:projectId/datatalk/*" }], location);
    if (!res) return false;
    return res.length > 0;
}
