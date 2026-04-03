import { CMSView } from "@rebasepro/types";
import { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";
import { useCMSUrlController } from "../hooks";
import { useEffect } from "react";

export function CustomCMSRoute({ cmsView }: {
    cmsView: CMSView
}) {

    const breadcrumbs = useBreadcrumbsController();
    const cmsUrlController = useCMSUrlController();

    useEffect(() => {
        breadcrumbs.set({
            breadcrumbs: [{
                title: cmsView.name,
                url: cmsUrlController.buildCMSUrlPath(cmsView.slug)
            }]
        });
    }, [cmsView.slug, cmsUrlController]);

    return cmsView.view;
}
