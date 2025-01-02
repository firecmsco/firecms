import React, { useContext, useEffect, useState } from "react";
import { useSideDialogsController } from "../hooks";
import { SideDialogPanelProps } from "../types";
import { Sheet } from "@firecms/ui";
import { useNavigationUnsavedChangesDialog } from "../internal/useUnsavedChangesDialog";
import { ErrorBoundary } from "../components";
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";

export type SideDialogContextProps = {
    blocked: boolean,
    setBlocked: (blocked: boolean) => void,
    setBlockedNavigationMessage: (message?: React.ReactNode) => void,
    width?: string,
    close: (force?: boolean) => void
}

const SideDialogContext = React.createContext<SideDialogContextProps>({
    width: "",
    blocked: false,
    setBlocked: (blocked: boolean) => {
    },
    setBlockedNavigationMessage: (message?: React.ReactNode) => {
    },
    close: () => {
    }
});

/**
 * This hook is used to access the properties of a particular side dialog,
 * in contrast with {@link useSideDialogsController} which handles the
 * state of all the dialogs.
 */
export const useSideDialogContext = () => useContext<SideDialogContextProps>(SideDialogContext);

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
                    offsetPosition={sidePanels.length - index - 1}/>)
        }
    </>;
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
                close: onCloseRequest
            }}>

            <Sheet
                open={Boolean(panel)}
                onOpenChange={(open) => !open && onCloseRequest()}
                title={"Side dialog " + panel?.key}
                // style={{
                //     zIndex: offsetPosition * 20 + 20,
                // }}
                // overlayStyle={{
                //     zIndex: offsetPosition * 20 + 10,
                // }}
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

                {!panel && <div style={{ width }}/>}

            </Sheet>

            <UnsavedChangesDialog
                open={drawerCloseRequested}
                handleOk={drawerCloseRequested ? handleDrawerCloseOk : handleNavigationOk}
                handleCancel={drawerCloseRequested ? handleDrawerCloseCancel : handleNavigationCancel}
                body={blockedNavigationMessage}/>

        </SideDialogContext.Provider>

    );
}
