import { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";
import { useEffect } from "react";

export function HomePageRoute({ children }: {
    children: React.ReactNode;
}) {

    const breadcrumbs = useBreadcrumbsController();

    useEffect(() => {
        breadcrumbs.set({
            breadcrumbs: []
        });
    }, []);

    return children;
}
