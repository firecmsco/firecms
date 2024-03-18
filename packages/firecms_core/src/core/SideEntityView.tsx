import { User } from "../types";
import { useSideDialogContext } from "./SideDialogs";
import { useSideEntityController } from "../hooks";
import { FORM_CONTAINER_WIDTH } from "../internal/common";
import { EntityEditViewProps } from "./EntityEditView";

export type SideEntityViewProps<M extends Record<string, any>> = EntityEditViewProps<M> & {
    formWidth?: number | string;
    onClose?: () => void;
}

export function SideEntityView<M extends Record<string, any>, UserType extends User>({
                                                                                         path,
                                                                                         entityId,
                                                                                         selectedSubPath,
                                                                                         copy,
                                                                                         collection,
                                                                                         parentCollectionIds,
                                                                                         onValuesAreModified,
                                                                                         formWidth,
                                                                                         onUpdate,
                                                                                         onClose
                                                                                     }: SideEntityViewProps<M>) {

    const sideDialogContext = useSideDialogContext();
    const sideEntityController = useSideEntityController();
    const resolvedFormWidth: string = typeof formWidth === "number" ? `${formWidth}px` : formWidth ?? FORM_CONTAINER_WIDTH;

    const onCloseHandler = () => {
        if (onClose) {
            onClose();
        } else {
            sideDialogContext.close();
        }
    }

    return <></>;
}
