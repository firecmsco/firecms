import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BreadcrumbEntry } from "../navigation";
import { useBreadcrumbsContext } from "../../contexts";
import { CMSView } from "../../models";


interface CMSViewRouteProps {
    cmsView: CMSView;
}

function CMSViewRoute({
                          cmsView
                      }: CMSViewRouteProps) {

    const { pathname } = useLocation();

    const breadcrumb: BreadcrumbEntry = {
        title: cmsView.name,
        url: pathname
    };

    const breadcrumbsContext = useBreadcrumbsContext();

    useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: [breadcrumb]
        });
    }, [pathname]);

    return <React.Fragment>
        {cmsView.view}
    </React.Fragment>;
}

export default CMSViewRoute;
