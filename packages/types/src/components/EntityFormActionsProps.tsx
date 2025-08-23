import { Entity, FormContext, ResolvedEntityCollection } from "../types";
import { FormexController } from "./formex";

export interface EntityFormActionsProps {
    path: string;
    collection: ResolvedEntityCollection;
    entity?: Entity;
    layout: "bottom" | "side";
    savingError?: Error;
    formex: FormexController<any>;
    disabled: boolean;
    status: "new" | "existing" | "copy";
    pluginActions: React.ReactNode[];
    openEntityMode: "side_panel" | "full_screen";
    showDefaultActions?: boolean;
    navigateBack: () => void;
    formContext: FormContext
}
