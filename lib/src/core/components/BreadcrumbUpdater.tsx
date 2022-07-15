import React, { PropsWithChildren } from "react";
import { useBreadcrumbsContext } from "../../hooks";

export interface BreadcrumbUpdaterProps {
    title: string;
    path: string;
}

/**
 * This component updates the breadcrumb in the app bar when rendered
 * @param children
 * @param title
 * @param path
 * @constructor
 * @category Components
 */
export function BreadcrumbUpdater({
                                      children,
                                      title,
                                      path
                                  }
                                      : PropsWithChildren<BreadcrumbUpdaterProps>) {

    const breadcrumbsContext = useBreadcrumbsContext();
    React.useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: [{
                title: title,
                url: path
            }]
        });
    }, [path, title]);

    return <>{children}</>;
}
