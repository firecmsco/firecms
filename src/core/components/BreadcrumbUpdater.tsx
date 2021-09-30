import React, { PropsWithChildren } from "react";
import { EntityCollectionTable } from "./EntityCollectionTable";
import { useBreadcrumbsContext } from "../../hooks/useBreadcrumbsContext";

export interface BreadcrumbRouteProps {
    title: string;
    path: string;
};

/**
 * This component updates the breadcrumb in the app bar when rendered
 * @param children
 * @param title
 * @param path
 * @constructor
 * @category Core components
 */
function BreadcrumbUpdater({
                               children,
                               title,
                               path
                           }
                               : PropsWithChildren<BreadcrumbRouteProps>) {

    const breadcrumbsContext = useBreadcrumbsContext();
    React.useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: [{
                title: title,
                url: path
            }]
        });
    }, [path]);

    return <> {children}</>;
}

export default BreadcrumbUpdater;
