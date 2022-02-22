import * as React from "react";
import { EntityReference } from "../../models";
import { PreviewComponentProps } from "../internal";
import {
    ReferencePreview,
    ReferencePreviewWrap
} from "../components/ReferencePreview";

export type ReferencePreviewProps =
    PreviewComponentProps<EntityReference>
    & { onHover?: boolean };

/**
 * @category Preview components
 */
export const ReferencePropertyPreview = React.memo<ReferencePreviewProps>(ReferencePreviewComponent, areEqual) as React.FunctionComponent<ReferencePreviewProps>;

function areEqual(prevProps: ReferencePreviewProps, nextProps: ReferencePreviewProps) {
    return prevProps.propertyKey === nextProps.propertyKey &&
        prevProps.size === nextProps.size &&
        prevProps.height === nextProps.height &&
        prevProps.width === nextProps.width &&
        prevProps.onHover === nextProps.onHover &&
        prevProps.value?.id === nextProps.value?.id &&
        prevProps.value?.path === nextProps.value?.path
        ;
}

function ReferencePreviewComponent<M extends { [Key: string]: any }>(
    {
        value,
        property,
        onClick,
        size,
        onHover
    }: ReferencePreviewProps) {

    const reference: EntityReference = value;
    const previewProperties = property.previewProperties;

    if (!property.path) {
        return <ReferencePreviewWrap onClick={onClick}
                                     onHover={onHover}
                                     size={size}>
            Disabled
        </ReferencePreviewWrap>
    }

    return <ReferencePreview path={property.path}
                                     reference={reference}
                                     size={size}
                                     onHover={onHover}
                                     onClick={onClick}
                                     previewProperties={previewProperties}/>

}
