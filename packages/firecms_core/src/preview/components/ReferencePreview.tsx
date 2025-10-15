import * as React from "react";

import { Entity, EntityCollection, EntityReference } from "../../types";
import { useCustomizationController, useEntityFetch, useNavigationController } from "../../hooks";
import { PreviewSize } from "../PropertyPreviewProps";
import { Skeleton } from "@firecms/ui";
import { ErrorBoundary, ErrorView } from "../../components";
import { EntityPreview, EntityPreviewContainer } from "../../components/EntityPreview";

export type ReferencePreviewProps = {
    disabled?: boolean;
    reference: EntityReference,
    size?: PreviewSize;
    previewProperties?: string[];
    onClick?: (e: React.SyntheticEvent) => void;
    hover?: boolean;
    includeEntityLink?: boolean;
    includeId?: boolean;
};

/**
 * @group Preview components
 */
export const ReferencePreview = function ReferencePreview(props: ReferencePreviewProps) {
    const reference = props.reference;
    if (!(typeof reference === "object" && "isEntityReference" in reference && reference.isEntityReference())) {
        console.warn("Reference preview received value of type", typeof reference);
        return <EntityPreviewContainer
            onClick={props.onClick}
            size={props.size ?? "medium"}>
            <ErrorView error={"Unexpected value. Click to edit"}
                       tooltip={JSON.stringify(reference)}/>
        </EntityPreviewContainer>;
    }
    return <ErrorBoundary>
        <ReferencePreviewInternal {...props} />
    </ErrorBoundary>;
};

function ReferencePreviewInternal({
                                      disabled,
                                      reference,
                                      previewProperties,
                                      size,
                                      hover,
                                      onClick,
                                      includeEntityLink = true,
                                      includeId = true
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
        includeEntityLink={includeEntityLink}
        includeId={includeId}
        onClick={onClick}
        hover={hover}/>
}

function ReferencePreviewExisting<M extends Record<string, any> = any>({
                                                                           reference,
                                                                           collection,
                                                                           previewProperties,
                                                                           size,
                                                                           disabled,
                                                                           includeEntityLink,
                                                                           includeId,
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
                          previewKeys={previewProperties}
                          disabled={disabled}
                          entity={usedEntity}
                          collection={collection}
                          onClick={onClick}
                          includeEntityLink={includeEntityLink}
                          includeId={includeId}
                          hover={hover}/>;

}

const referencesCache = new Map<string, Entity<any>>();
