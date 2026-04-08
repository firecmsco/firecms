import type { CMSView } from "@rebasepro/types";
;
import { useBreadcrumbsController } from "@rebasepro/core";
import { useCMSUrlController } from "@rebasepro/core";
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
