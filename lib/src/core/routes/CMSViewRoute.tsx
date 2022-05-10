import { Route } from "react-router-dom";
import { CMSView } from "../../models";
import { BreadcrumbUpdater } from "./BreadcrumbUpdater";

export function CMSRoute({ cmsView: { name, view, path } }: { cmsView: CMSView }) {
    return <Route
        path={path}
        element={
            <BreadcrumbUpdater
                path={path}
                title={name}>
                {view}
            </BreadcrumbUpdater>}
    />;
}
