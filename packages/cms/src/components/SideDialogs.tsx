import type { SideDialogPanelProps } from "../hooks/useSideDialogsController";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useSideDialogsController } from "../hooks";
;
import { Sheet } from "@rebasepro/ui";
import { useUnsavedChangesDialog, UnsavedChangesDialog } from "@rebasepro/core";
import { ErrorBoundary } from "@rebasepro/ui";

export type SideDialogController = {
    blocked: boolean,
    setBlocked: (blocked: boolean) => void,
    setBlockedNavigationMessage: (message?: React.ReactNode) => void,
    width?: string,
    close: (force?: boolean) => void;
    pendingClose: boolean,
    setPendingClose: (pendingClose: boolean) => void
}

const SideDialogContext = React.createContext<SideDialogController>({
    width: "",
    blocked: false,
    setBlocked: (blocked: boolean) => {
    },
    setBlockedNavigationMessage: (message?: React.ReactNode) => {
    },
    close: () => {
    },
    pendingClose: false,
    setPendingClose: () => {

    }
});

/**
 * This hook is used to access the properties of a particular side dialog,
 * in contrast with {@link useSideDialogsController} which handles the
 * state of all the dialogs.
 */
export const useSideDialogContext = () => useContext<SideDialogController>(SideDialogContext);

/**
 * This is the component in charge of rendering the side dialogs used
 * for editing entities. Use the {@link useSideEntityController} to open
 * and control the dialogs.
 * This component needs a parent {@link Rebase}
 * {@link useSideDialogsController}
 * @group Components
 */
export function SideDialogs() {

    const sideDialogsController = useSideDialogsController();

    const sidePanels = sideDialogsController.sidePanels;

    const panels: (SideDialogPanelProps | undefined)[] = [...sidePanels];
    panels.push(undefined);

    return <>
        {
            panels.map((panel, index) =>
                <SideDialogView
                    key={`side_dialog_${index}`}
                    panel={panel}
                    offsetPosition={sidePanels.length - index - 1}
                    isTopPanel={index === sidePanels.length - 1} />)
        }
    </>;
}

function SideDialogView({
    offsetPosition,
    panel,
    isTopPanel
}: {
    offsetPosition: number,
    panel?: SideDialogPanelProps,
    isTopPanel: boolean
}) {

    // was the closing of the dialog requested by the drawer
    const [drawerCloseRequested, setDrawerCloseRequested] = useState<boolean>(false);
    const [blocked, setBlocked] = useState(false);
    const [blockedNavigationMessage, setBlockedNavigationMessage] = useState<React.ReactNode | undefined>();

    const [pendingClose, setPendingClose] = useState(false);

    const widthRef = React.useRef<string | undefined>(panel?.width);
    const width = widthRef.current;

    const sideDialogsController = useSideDialogsController();

    // Prevent non-topmost dialogs from being dismissed by outside clicks.
    // When stacked Sheets exist, clicking the overlay of the topmost dialog
    // would otherwise propagate and dismiss lower dialogs too.
    const preventDismiss = useCallback((e: Event) => {
        e.preventDefault();
    }, []);

    const { dialogProps, triggerDialog } = useUnsavedChangesDialog(
        blocked,
        () => setBlocked(false)
    );

    useEffect(() => {
        if (panel)
            widthRef.current = panel.width;
    }, [panel])

    const handleDrawerCloseOk = () => {
        setBlocked(false);
        setDrawerCloseRequested(false);
        sideDialogsController.close();
        panel?.onClose?.();
    };

    const handleDrawerCloseCancel = () => {
        setDrawerCloseRequested(false);
    };

    const onCloseRequest = (force?: boolean) => {
        if (blocked && !force) {
            setDrawerCloseRequested(true);
            triggerDialog();
        } else {
            sideDialogsController.close();
            panel?.onClose?.();
        }
    };

    return (
        <SideDialogContext.Provider
            value={{
                blocked,
                setBlocked,
                setBlockedNavigationMessage,
                width,
                close: onCloseRequest,
                pendingClose,
                setPendingClose
            }}>

            <Sheet
                open={Boolean(panel)}
                includeBackgroundOverlay={isTopPanel}
                overlayZIndex="z-40"
                onOpenChange={(open) => {
                    if (!open) {
                        // Check if any suggestion menu is visible in DOM
                        const suggestionMenu = document.querySelector("[data-suggestion-menu=\"true\"]");
                        if (suggestionMenu && window.getComputedStyle(suggestionMenu).visibility !== "hidden") {
                            // Don't close the sheet if a suggestion menu is visible
                            // Let Tiptap handle closing the menu first
                            return;
                        }
                        onCloseRequest();
                    }
                }}
                onPointerDownOutside={!isTopPanel ? preventDismiss : undefined}
                onInteractOutside={!isTopPanel ? preventDismiss : undefined}
                title={"Side dialog " + panel?.key}
            >
                {panel &&
                    <div
                        className={"transform max-w-[100vw] lg:max-w-[95vw] flex flex-col h-full transition-all duration-250 ease-in-out bg-white dark:bg-surface-900 "}
                        style={{
                            width: panel.width,
                            transform: `translateX(-${offsetPosition * 200}px)`,
                        }}
                    >
                        <ErrorBoundary>
                            {panel.component}
                        </ErrorBoundary>
                    </div>}

                {!panel && <div style={{ width }} />}

            </Sheet>

            <UnsavedChangesDialog
                {...dialogProps}
                handleOk={() => {
                    dialogProps.handleOk();
                    if (drawerCloseRequested) {
                        handleDrawerCloseOk();
                    }
                }}
                handleCancel={() => {
                    dialogProps.handleCancel();
                    if (drawerCloseRequested) {
                        handleDrawerCloseCancel();
                    }
                }}
                body={blockedNavigationMessage || "There are unsaved changes"} />

        </SideDialogContext.Provider>

    );
}
