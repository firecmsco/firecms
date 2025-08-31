import * as React from "react";

import { Entity, EntityCollection, EntityRelation, PreviewSize } from "@firecms/types";
import { useCustomizationController, useEntityFetch, useNavigationController } from "../../hooks";
import { Skeleton } from "@firecms/ui";
import { EntityPreview, EntityPreviewContainer, ErrorView } from "../../components";

export type RelationPreviewProps = {
    disabled?: boolean;
    relation: EntityRelation,
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
export const RelationPreview = function RelationPreview(props: RelationPreviewProps) {
    const relation = props.relation;
    if (!(typeof relation === "object" && "isEntityRelation" in relation && relation.isEntityRelation())) {
        console.warn("Relation preview received value of type", typeof relation);
        return <EntityPreviewContainer
            onClick={props.onClick}
            size={props.size}>
            <ErrorView error={"Unexpected value. Click to edit"}
                       tooltip={JSON.stringify(relation)}/>
        </EntityPreviewContainer>;
    }
    return <RelationPreviewInternal {...props} />;
};

function RelationPreviewInternal({
                                     disabled,
                                     relation,
                                     previewProperties,
                                     size,
                                     hover,
                                     onClick,
                                     includeEntityLink = true,
                                     includeId = true
                                 }: RelationPreviewProps) {

    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();

    const collection = navigationController.getCollection(relation.path);
    if (!collection) {
        if (customizationController.components?.missingReference) {
            return <customizationController.components.missingReference path={relation.path}/>;
        } else {
            throw Error(`Couldn't find the corresponding collection view for the path: ${relation.path}`);
        }
    }

    return <RelationPreviewExisting
        relation={relation}
        collection={collection}
        previewProperties={previewProperties}
        size={size}
        disabled={disabled}
        includeEntityLink={includeEntityLink}
        includeId={includeId}
        onClick={onClick}
        hover={hover}/>
}

function RelationPreviewExisting<M extends Record<string, any> = any>({
                                                                          relation,
                                                                          collection,
                                                                          previewProperties,
                                                                          size,
                                                                          disabled,
                                                                          includeEntityLink,
                                                                          includeId,
                                                                          onClick,
                                                                          hover
                                                                      }: RelationPreviewProps & {
    collection: EntityCollection<M>
}) {

    const {
        entity,
        dataLoading,
        dataLoadingError
    } = useEntityFetch({
        path: relation.path,
        entityId: relation.id,
        collection,
        useCache: true
    });

    if (entity) {
        relationsCache.set(relation.pathWithId, entity);
    }

    const usedEntity = entity ?? relationsCache.get(relation.pathWithId);

    let body: React.ReactNode;

    if (!relation) {
        body = <ErrorView error={"Relation not set"}/>;
    } else if (usedEntity && !usedEntity.values) {
        body = <ErrorView error={"Relation does not exist"}
                          tooltip={relation.path}/>;
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

const relationsCache = new Map<string, Entity<any>>();
