import React, { useEffect } from "react";
import { useRouteMatch } from "react-router-dom";
import { BreadcrumbEntry } from "../navigation";
import { useBreadcrumbsContext } from "../../contexts";
import { CMSView } from "../CMSAppProps";


interface CMSViewRouteProps {
    cmsView: CMSView;
}

function CMSViewRoute({
                          cmsView
                      }: CMSViewRouteProps) {

    const { url } = useRouteMatch();

    const breadcrumb: BreadcrumbEntry = {
        title: cmsView.name,
        url: url
    };

    const breadcrumbsContext = useBreadcrumbsContext();

    useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: [breadcrumb]
        });
    }, [url]);

    return <React.Fragment>
        {cmsView.view}
    </React.Fragment>;
}

export default CMSViewRoute;
