import { CMSView } from "../types";
import { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";
import { useEffect } from "react";

export function CustomCMSRoute({ cmsView }: {
    cmsView: CMSView
}) {

    const breadcrumbs = useBreadcrumbsController();

    useEffect(() => {
        breadcrumbs.set({
            breadcrumbs: [{
                title: cmsView.name,
                url: cmsView.path
            }]
        });
    }, [cmsView.path]);

    return cmsView.view;
}
