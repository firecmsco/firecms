import React, { useContext, useEffect, useRef, useState } from "react";
import { useSideDialogsController } from "../hooks";
import { EntitySidePanelProps, SideDialogPanelProps } from "../types";
import { Sheet } from "@firecms/ui";
import { useNavigationUnsavedChangesDialog } from "../internal/useUnsavedChangesDialog";
import { ErrorBoundary } from "../components";
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";
import { EntitySidePanel } from "./EntitySidePanel";

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
 * This component needs a parent {@link FireCMS}
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
                    offsetPosition={sidePanels.length - index - 1} />)
        }
    </>;
}

// Menus, selects and popovers opened inside a side dialog are dismissed by Radix as
// soon as the pointer goes down, but the dialog underneath only makes up its mind on
// the click that follows, when that layer is already gone and the dialog looks like
// the topmost one. Without this, the click that dismisses an open menu also asks the
// panel to close, and an edited entity greets the user with the unsaved changes dialog.
const NESTED_LAYER_SELECTOR = [
    "[data-radix-menu-content]",
    "[data-radix-select-viewport]",
    "[data-radix-popper-content-wrapper] [role=\"dialog\"]",
    "[data-suggestion-menu=\"true\"]"
].join(",");

function useNestedLayerOpenOnPointerDown() {
    const ref = useRef(false);
    useEffect(() => {
        const onPointerDown = () => {
            ref.current = Array.from(document.querySelectorAll(NESTED_LAYER_SELECTOR))
                .some(element => window.getComputedStyle(element).visibility !== "hidden");
        };
        // the keyboard dismisses one layer at a time on its own, so a stale pointer
        // interaction must not swallow a close requested with Escape
        const onKeyDown = () => {
            ref.current = false;
        };
        document.addEventListener("pointerdown", onPointerDown, true);
        document.addEventListener("keydown", onKeyDown, true);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown, true);
            document.removeEventListener("keydown", onKeyDown, true);
        };
    }, []);
    return ref;
}

function SideDialogView({
    offsetPosition,
    panel
}: {
    offsetPosition: number,
    panel?: SideDialogPanelProps
}) {

    // was the closing of the dialog requested by the drawer
    const [drawerCloseRequested, setDrawerCloseRequested] = useState<boolean>(false);
    const [blocked, setBlocked] = useState(false);
    const [blockedNavigationMessage, setBlockedNavigationMessage] = useState<React.ReactNode | undefined>();

    const [pendingClose, setPendingClose] = useState(false);

    const nestedLayerOpenOnPointerDown = useNestedLayerOpenOnPointerDown();

    const widthRef = React.useRef<string | undefined>(panel?.width);
    const width = widthRef.current;

    const sideDialogsController = useSideDialogsController();

    const {
        navigationWasBlocked,
        handleOk: handleNavigationOk,
        handleCancel: handleNavigationCancel
    } = useNavigationUnsavedChangesDialog(
        blocked && !drawerCloseRequested,
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
                onOpenChange={(open) => {
                    if (!open) {
                        // Check if any suggestion menu is visible in DOM
                        const suggestionMenu = document.querySelector("[data-suggestion-menu=\"true\"]");
                        if (suggestionMenu && window.getComputedStyle(suggestionMenu).visibility !== "hidden") {
                            // Don't close the sheet if a suggestion menu is visible
                            // Let Tiptap handle closing the menu first
                            return;
                        }
                        // this interaction started on top of a menu or popover: it dismissed
                        // that layer, it was not a request to close the panel. The flag is
                        // left alone because a single click asks to close more than once;
                        // the next pointer or key interaction recomputes it.
                        if (nestedLayerOpenOnPointerDown.current) {
                            return;
                        }
                        onCloseRequest();
                    }
                }}
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
                            {/* Lazy render EntitySidePanel from props for better performance */}
                            {panel.component ?? (panel.additional ? <EntitySidePanel {...(panel.additional as EntitySidePanelProps)} /> : null)}
                        </ErrorBoundary>
                    </div>}

                {!panel && <div style={{ width }} />}

            </Sheet>

            <UnsavedChangesDialog
                open={drawerCloseRequested}
                handleOk={drawerCloseRequested ? handleDrawerCloseOk : handleNavigationOk}
                handleCancel={drawerCloseRequested ? handleDrawerCloseCancel : handleNavigationCancel}
                body={blockedNavigationMessage} />

        </SideDialogContext.Provider>

    );
}
