import { EntityCollectionView, EntityCollectionViewProps } from "../components";
import { useNavigationController } from "../hooks";
import { useBreadcrumbsController } from "../hooks/useBreadcrumbsController";
import { useEffect } from "react";

export type EntityCollectionRouteProps<M extends Record<string, any>> = EntityCollectionViewProps<M>;

export function EntityCollectionRoute<M extends Record<string, any>>(props: EntityCollectionRouteProps<M>) {

    const breadcrumbs = useBreadcrumbsController();
    const navigation = useNavigationController();

    useEffect(() => {
        breadcrumbs.set({
            breadcrumbs: [{
                title: props.name,
                url: navigation.buildUrlCollectionPath(props.path)
            }]
        });
    }, [props.path]);

    return <EntityCollectionView {...props} />;
}
