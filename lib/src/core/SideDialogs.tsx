import React, { useContext, useState } from "react";
import { useSideDialogsController } from "../hooks/useSideDialogsController";
import { SideDialogDrawer } from "./internal/SideDialogDrawer";
import { ErrorBoundary } from "./internal/ErrorBoundary";
import {
    UnsavedChangesDialog,
    useNavigationUnsavedChangesDialog
} from "./internal/useUnsavedChangesDialog";
import { CONTAINER_WIDTH } from "./internal/common";

/**
 * Controller to open the side dialog
 * @category Hooks and utilities
 */
export interface SideDialogsController {

    /**
     * Close the last panel
     */
    close: () => void;

    /**
     * List of side panels currently open
     */
    sidePanels: SideDialogPanelProps[];

    /**
     * @param props
     */
    open: <P>(props: SideDialogPanelProps<P>) => void;

    replace: <P>(props: SideDialogPanelProps<P>) => void;
}

/**
 * Props used to open a side dialog
 * @category Hooks and utilities
 */
export interface SideDialogPanelProps<P = any> {

    key: string;

    Component: React.ComponentType<P>;

    props: P;

    urlPath?: string;

    parentUrlPath?: string;

}

export type SideDialogContextProps = {
    modified: boolean,
    setModified: (modified: boolean) => void,
    close: () => void
}
const SideDialogContext = React.createContext<SideDialogContextProps>({
    modified: false,
    setModified: (modified: boolean) => {
    },
    close: () => {
    }
});

export const useSideDialogContext = () => useContext<SideDialogContextProps>(SideDialogContext);

/**
 * This is the component in charge of rendering the side dialogs used
 * for editing entities. Use the {@link useSideEntityController} to open
 * and control the dialogs.
 * This component needs a parent {@link FireCMS}
 * {@see useSideDialogsController}
 * @category Components
 */
export function SideDialogs() {

    const sideDialogsController = useSideDialogsController();

    const sidePanels = sideDialogsController.sidePanels;
    //  we add an extra closed drawer, that it is used to maintain the transition when a drawer is removed
    const allPanels = [...sidePanels, undefined];

    return <>
        {
            allPanels.map((panel, index) => {
                return <SideDialogView
                    key={`side_dialog_${index}`}
                    index={index}
                    panel={panel}
                    offsetPosition={sidePanels.length - index - 1}/>;
            })
        }
    </>;
}

function SideDialogView({
                            index,
                            offsetPosition,
                            panel
                        }: {
    index: number,
    offsetPosition: number,
    panel?: SideDialogPanelProps<{}>
}) {

    // was the closing of the dialog requested by the drawer
    const [drawerCloseRequested, setDrawerCloseRequested] = useState(false);
    const [modified, setModified] = useState(false);
    const sideDialogsController = useSideDialogsController();


    console.log("offsetPosition", index, offsetPosition);
    const {
        navigationWasBlocked,
        handleOk: handleNavigationOk,
        handleCancel: handleNavigationCancel
    } = useNavigationUnsavedChangesDialog(
        modified && !drawerCloseRequested,
        () => setModified(false)
    );

    const handleDrawerCloseOk = () => {
        setModified(false);
        setDrawerCloseRequested(false);
        sideDialogsController.close();
    };

    const handleDrawerCloseCancel = () => {
        setModified(false);
    };

    const onCloseRequest = () => {
        if (modified) {
            setDrawerCloseRequested(true);
        } else {
            sideDialogsController.close();
        }
    }

    return (
        <SideDialogContext.Provider value={{
            modified,
            setModified,
            close: onCloseRequest
        }}>

            {panel && <>
                <SideDialogDrawer
                    key={`side_dialog_${index}`}
                    open={Boolean(panel)}
                    onClose={onCloseRequest}
                    offsetPosition={offsetPosition}
                >
                    <ErrorBoundary>
                        <panel.Component {...panel.props}/>
                    </ErrorBoundary>
                </SideDialogDrawer>

                <UnsavedChangesDialog
                    open={navigationWasBlocked || drawerCloseRequested}
                    handleOk={drawerCloseRequested ? handleDrawerCloseOk : handleNavigationOk}
                    handleCancel={drawerCloseRequested ? handleDrawerCloseCancel : handleNavigationCancel}
                    name={"TODO"}/>
            </>}

            {!panel && <SideDialogDrawer
                key={`side_dialog_${index}`}
                open={false}
                offsetPosition={offsetPosition}>
                <div style={{ width: CONTAINER_WIDTH }}/>
            </SideDialogDrawer>}

        </SideDialogContext.Provider>

    );
}
