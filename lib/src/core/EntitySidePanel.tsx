import React, { useCallback, useEffect, useMemo } from "react";

import { EntitySidePanelProps } from "../types";
import { FORM_CONTAINER_WIDTH } from "./internal/common";
import { useNavigationContext, useSideEntityController } from "../hooks";

import { ErrorBoundary } from "./components";
import { EntityView } from "./internal/EntityView";
import { useSideDialogContext } from "./SideDialogs";

import { useTranslation } from "react-i18next";

/**
 * This is the component in charge of rendering the side dialog used
 * for editing entities. Use the {@link useSideEntityController} to open
 * and control the dialogs.
 * This component needs a parent {@link FireCMS}
 * {@link useSideEntityController}
 * @category Components
 */
export function EntitySidePanel(props: EntitySidePanelProps) {
    const { t } = useTranslation();

    const { blocked, setBlocked, setBlockedNavigationMessage } =
        useSideDialogContext();

    const navigationContext = useNavigationContext();

    const collection = useMemo(() => {
        if (!props) return undefined;
        let usedCollection = props.collection;

        if (!usedCollection) {
            usedCollection = !props
                ? undefined
                : navigationContext.getCollection(props.path, props.entityId);
            if (!usedCollection) {
                console.error(
                    t("ERROR: No collection found in path `") ||
                        "ERROR: No collection found in path `",
                    props.path,
                    t("`. Entity id: ") || "`. Entity id: ",
                    props.entityId
                );
                throw Error(
                    t("ERROR: No collection found in path `") ||
                        "ERROR: No collection found in path `" +
                            props.path +
                            t(
                                "`. Make sure you have defined a collection for this path in the root navigation."
                            ) ||
                        "`. Make sure you have defined a collection for this path in the root navigation."
                );
            }
        }
        return usedCollection;
    }, [navigationContext, props]);

    useEffect(() => {
        function beforeunload(e: any) {
            if (blocked && collection) {
                e.preventDefault();
                e.returnValue =
                    t(
                        `You have unsaved changes in this ${collection.name}. Are you sure you want to leave this page?`
                    ) ||
                    `You have unsaved changes in this ${collection.name}. Are you sure you want to leave this page?`;
            }
        }

        if (typeof window !== "undefined")
            window.addEventListener("beforeunload", beforeunload);

        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("beforeunload", beforeunload);
        };
    }, [blocked, collection]);

    const onValuesAreModified = useCallback(
        (modified: boolean) => {
            setBlocked(modified);
            setBlockedNavigationMessage(
                modified ? (
                    <>
                        {" "}
                        You have unsaved changes in this{" "}
                        <b>{collection?.name}</b>.
                    </>
                ) : undefined
            );
        },
        [collection?.name, setBlocked, setBlockedNavigationMessage]
    );

    if (!props || !collection) {
        return <div style={{ width: FORM_CONTAINER_WIDTH }} />;
    }

    return (
        <>
            <ErrorBoundary>
                <EntityView
                    {...props}
                    formWidth={props.width}
                    collection={collection}
                    onValuesAreModified={onValuesAreModified}
                />
            </ErrorBoundary>
        </>
    );
}
