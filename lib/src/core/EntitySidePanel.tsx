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
                throw Error(
                    String(
                        t("errorMessages.noCollectionFound", {
                            path: props.path,
                        })
                    )
                );
            }
        }
        return usedCollection;
    }, [navigationContext, props, t]);

    useEffect(() => {
        function beforeunload(e: any) {
            if (blocked && collection) {
                e.preventDefault();
                e.returnValue = t("messages.unsavedChanges", {
                    collectionName: collection.name,
                });
            }
        }

        if (typeof window !== "undefined")
            window.addEventListener("beforeunload", beforeunload);

        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("beforeunload", beforeunload);
        };
    }, [blocked, collection, t]);

    const onValuesAreModified = useCallback(
        (modified: boolean) => {
            setBlocked(modified);
            setBlockedNavigationMessage(
                modified
                    ? (
                        <>
                            {t("messages.unsavedChangesCollection", { collectionName: collection?.name })}
                        </>
                    )
                    : undefined
            );
        },
        [collection?.name, setBlocked, setBlockedNavigationMessage, t]
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
