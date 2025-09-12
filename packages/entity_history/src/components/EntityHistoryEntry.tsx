import * as React from "react";

import {
    Chip,
    cls,
    defaultBorderMixin,
    IconButton,
    KeyboardBackspaceIcon,
    KeyboardTabIcon,
    Tooltip,
    Typography
} from "@firecms/ui";
import {
    Entity,
    EntityCollection,
    EntityValues,
    getPropertyInPath,
    getValueInPath,
    PreviewSize,
    Property,
    PropertyPreview,
    resolveCollection,
    SkeletonPropertyComponent,
    useAuthController,
    useCustomizationController,
    useNavigationController,
    useSideEntityController
} from "@firecms/core";
import { useHistoryController } from "../HistoryControllerProvider";
import { UserChip } from "./UserChip";

export type EntityPreviewProps = {
    size: PreviewSize,
    actions?: React.ReactNode,
    collection?: EntityCollection,
    hover?: boolean;
    previewKeys?: string[],
    entity: Entity<any>,
    previousValues?: EntityValues<any>;
    onClick?: (e: React.SyntheticEvent) => void;
};

function PreviousValueView({
                               previousValueInPath,
                               childProperty,
                               key
                           }: {
    previousValueInPath: any,
    childProperty: Property,
    key: string
}) {
    if (typeof previousValueInPath === "string" || typeof previousValueInPath === "number") {
        return <Typography variant={"caption"} color={"secondary"} className="line-through">
            {previousValueInPath}
        </Typography>;
    } else if (typeof previousValueInPath === "boolean") {
        return <Typography variant={"caption"} color={"secondary"} className="line-through">
            {previousValueInPath ? "true" : "false"}
        </Typography>;

    } else {
        return <Tooltip
            side={"left"}
            title={<div className={"flex flex-col gap-2"}>
                <Typography variant={"caption"} color={"secondary"}>
                    Previous value
                </Typography>
                <PropertyPreview
                    propertyKey={key as string}
                    value={previousValueInPath}
                    property={childProperty as Property}
                    size={"small"}/>
            </div>}>
            <KeyboardBackspaceIcon size={"smallest"} color={"disabled"} className={"mb-1"}/>
        </Tooltip>
    }
}

/**
 * This view is used to display a preview of an entity.
 * It is used by default in reference fields and whenever a reference is displayed.
 */
export function EntityHistoryEntry({
                                       actions,
                                       hover,
                                       collection: collectionProp,
                                       previewKeys,
                                       onClick,
                                       size,
                                       entity,
                                       previousValues
                                   }: EntityPreviewProps) {

    const authController = useAuthController();
    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();
    const sideEntityController = useSideEntityController();

    const collection = collectionProp ?? navigationController.getCollection(entity.path);
    const updatedOn = entity.values?.["__metadata"]?.["updated_on"];
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${entity.path}`);
    }

    const updatedBy = entity.values?.["__metadata"]?.["updated_by"];
    const { getUser } = useHistoryController();
    const user = getUser?.(updatedBy);

    const resolvedCollection = React.useMemo(() => resolveCollection({
        collection,
        path: entity.path,
        values: entity.values,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [collection]);

    return <div className={"w-full flex flex-col gap-2 mt-4"}>
        <div className={"ml-4 flex items-center gap-4"}>
            <Typography variant={"body2"} color={"secondary"}>{updatedOn.toLocaleString()}</Typography>
            {!user && updatedBy && <Chip size={"small"}>{updatedBy}</Chip>}
            {user && <UserChip user={user}/>}
        </div>
        <div
            className={cls(
                "bg-white dark:bg-surface-900",
                "min-h-[42px]",
                "w-full",
                "items-center",
                hover ? "hover:bg-surface-accent-50 dark:hover:bg-surface-800 group-hover:bg-surface-accent-50 dark:group-hover:bg-surface-800" : "",
                size === "small" ? "p-1" : "px-2 py-1",
                "flex border rounded-lg",
                onClick ? "cursor-pointer" : "",
                defaultBorderMixin
            )}>


            {actions}

            {entity &&
                <Tooltip title={"See details for this revision"}
                         className={"my-2 grow-0 shrink-0 self-start"}>
                    <IconButton
                        color={"inherit"}
                        className={""}
                        onClick={(e) => {

                            sideEntityController.open({
                                entityId: entity.id,
                                path: entity.path,
                                allowFullScreen: false,
                                collection: {
                                    ...collection,
                                    subcollections: undefined,
                                    entityViews: undefined,
                                    permissions: {
                                        create: false,
                                        delete: false,
                                        edit: false,
                                        read: true
                                    }
                                },
                                updateUrl: true
                            });
                        }}>
                        <KeyboardTabIcon/>
                    </IconButton>
                </Tooltip>}

            <div className={"flex flex-col grow w-full m-1 shrink min-w-0"}>

                {previewKeys && previewKeys.map((key) => {
                    const childProperty = getPropertyInPath(resolvedCollection.properties, key);

                    const valueInPath = getValueInPath(entity.values, key);
                    const previousValueInPath = previousValues ? getValueInPath(previousValues, key) : undefined;

                    const element = childProperty ? (entity
                            ? <PropertyPreview
                                propertyKey={key as string}
                                value={valueInPath}
                                property={childProperty as Property}
                                size={"small"}/>
                            : <SkeletonPropertyComponent
                                property={childProperty as Property}
                                size={"small"}/>) :
                        <Typography variant={"body2"}>
                            {typeof valueInPath === "string" ? valueInPath : JSON.stringify(valueInPath)}
                        </Typography>;
                    return (
                        <div key={"ref_prev_" + key}
                             className="flex w-full my-1 items-center">
                            <Typography variant={"caption"}
                                        color={"secondary"}
                                        className="min-w-[140px] md:min-w-[200px] w-1/5 pr-8 overflow-hidden text-ellipsis text-right">
                                {key}
                            </Typography>
                            <div className="w-4/5">
                                {previousValueInPath !== undefined && previousValueInPath !== valueInPath &&
                                    <PreviousValueView previousValueInPath={previousValueInPath}
                                                       childProperty={childProperty as Property}
                                                       key={key}/>
                                }
                                {element}
                            </div>
                        </div>
                    );
                })}

            </div>

        </div>
    </div>
}

