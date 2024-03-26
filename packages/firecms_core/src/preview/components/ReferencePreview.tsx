import * as React from "react";

import { Entity, EntityCollection, EntityReference } from "../../types";
import {
    useCustomizationController,
    useEntityFetch,
    useNavigationController,
    useSideEntityController
} from "../../hooks";
import { PreviewSize } from "../PropertyPreviewProps";
import { IconButton, KeyboardTabIcon, Skeleton, Tooltip } from "@firecms/ui";
import { ErrorView } from "../../components";
import { useAnalyticsController } from "../../hooks/useAnalyticsController";
import { EntityPreview, EntityPreviewContainer } from "../../components/EntityPreview";

export type ReferencePreviewProps = {
    disabled?: boolean;
    reference: EntityReference,
    size: PreviewSize;
    previewProperties?: string[];
    onClick?: (e: React.SyntheticEvent) => void;
    hover?: boolean;
    allowEntityNavigation?: boolean;
};

/**
 * @group Preview components
 */
export const ReferencePreview = React.memo<ReferencePreviewProps>(function ReferencePreview(props: ReferencePreviewProps) {
    const reference = props.reference;
    if (!(typeof reference === "object" && "isEntityReference" in reference && reference.isEntityReference())) {
        console.warn("Reference preview received value of type", typeof reference);
        return <EntityPreviewContainer
            onClick={props.onClick}
            size={props.size}>
            <ErrorView error={"Unexpected value. Click to edit"}
                       tooltip={JSON.stringify(reference)}/>
        </EntityPreviewContainer>;
    }
    return <ReferencePreviewInternal {...props} />;
}, areEqual) as React.FunctionComponent<ReferencePreviewProps>;

function areEqual(prevProps: ReferencePreviewProps, nextProps: ReferencePreviewProps) {
    return prevProps.disabled === nextProps.disabled &&
        prevProps.size === nextProps.size &&
        prevProps.hover === nextProps.hover &&
        prevProps.reference?.id === nextProps.reference?.id &&
        prevProps.reference?.path === nextProps.reference?.path &&
        prevProps.allowEntityNavigation === nextProps.allowEntityNavigation
        ;
}

function ReferencePreviewInternal<M extends Record<string, any>>({
                                                                     disabled,
                                                                     reference,
                                                                     previewProperties,
                                                                     size,
                                                                     hover,
                                                                     onClick,
                                                                     allowEntityNavigation = true
                                                                 }: ReferencePreviewProps) {

    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();

    const collection = navigationController.getCollection(reference.path);
    if (!collection) {
        if (customizationController.components?.missingReference) {
            return <customizationController.components.missingReference path={reference.path}/>;
        } else {
            throw Error(`Couldn't find the corresponding collection view for the path: ${reference.path}`);
        }
    }

    return <ReferencePreviewExisting
        reference={reference}
        collection={collection}
        previewProperties={previewProperties}
        size={size}
        disabled={disabled}
        allowEntityNavigation={allowEntityNavigation}
        onClick={onClick}
        hover={hover}/>
}

function ReferencePreviewExisting<M extends Record<string, any> = any>({
                                                                           reference,
                                                                           collection,
                                                                           previewProperties,
                                                                           size,
                                                                           disabled,
                                                                           allowEntityNavigation,
                                                                           onClick,
                                                                           hover
                                                                       }: ReferencePreviewProps & {
    collection: EntityCollection<M>
}) {

    const {
        entity,
        dataLoading,
        dataLoadingError
    } = useEntityFetch({
        path: reference.path,
        entityId: reference.id,
        collection,
        useCache: true
    });

    if (entity) {
        referencesCache.set(reference.pathWithId, entity);
    }

    const usedEntity = entity ?? referencesCache.get(reference.pathWithId);

    let body: React.ReactNode;

    if (!reference) {
        body = <ErrorView error={"Reference not set"}/>;
    } else if (usedEntity && !usedEntity.values) {
        body = <ErrorView error={"Reference does not exist"}
                          tooltip={reference.path}/>;
    }
    if (body) {

        return (
            <EntityPreviewContainer onClick={disabled ? undefined : onClick}
                                    hover={disabled ? undefined : hover}
                                    size={size}>
                {body}
            </EntityPreviewContainer>
        );
    }

    if (dataLoading && !usedEntity) {
        return (
            <EntityPreviewContainer onClick={disabled ? undefined : onClick}
                                    hover={disabled ? undefined : hover}
                                    size={size}>
                <Skeleton/>
            </EntityPreviewContainer>
        );
    }

    if (!usedEntity) {
        return (
            <EntityPreviewContainer onClick={disabled ? undefined : onClick}
                                    hover={disabled ? undefined : hover}
                                    size={size}>
                <ErrorView error={"Entity not found"}/>
            </EntityPreviewContainer>
        );
    }
    return <EntityPreview size={size}
                          previewProperties={previewProperties}
                          disabled={disabled}
                          entity={usedEntity}
                          collection={collection}
                          onClick={onClick}
                          includeEntityNavigation={allowEntityNavigation}
                          hover={hover}/>;

}

const referencesCache = new Map<string, Entity<any>>();
