import type { AppView } from "@rebasepro/types";
;
import { useEffect } from "react";
import { useBreadcrumbsController } from "../index";
import { useUrlController } from "../index";

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
