import type { AppView } from "@rebasepro/types";
;
import { useBreadcrumbsController } from "@rebasepro/core";
import { useUrlController } from "@rebasepro/core";
import { useEffect } from "react";

export function CustomViewRoute({ view }: {
    view: AppView
}) {

    const breadcrumbs = useBreadcrumbsController();
    const urlController = useUrlController();

    useEffect(() => {
        breadcrumbs.set({
            breadcrumbs: [{
                title: view.name,
                url: urlController.buildAppUrlPath(view.slug)
            }]
        });
    }, [view.slug, urlController]);

    return view.view;
}
