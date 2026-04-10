import { useMemo } from "react";
import { useRebaseContext } from "@rebasepro/core";
import type {
    AuthController,
    RebaseContext,
    SideDialogsController,
    SideEntityController,
    User
} from "@rebasepro/types";
import type {
    CollectionRegistryController,
    NavigationStateController,
    UrlController
} from "@rebasepro/types";
import { useSideEntityController } from "./useSideEntityController";
import { useSideDialogsController } from "./useSideDialogsController";
import {
    useUrlController,
    useNavigationStateController,
    useCollectionRegistryController
} from "./navigation/contexts";

/**
 * The CMS context extends the core RebaseContext with CMS-specific
 * controllers that are only available inside the CMS routing tree.
 *
 * Use {@link useCMSContext} to obtain an instance.
 * @group Hooks and utilities
 */
export type CMSContext<
    USER extends User = User,
    AuthControllerType extends AuthController<USER> = AuthController<USER>
> = RebaseContext<USER, AuthControllerType> & {
    sideEntityController: SideEntityController;
    sideDialogsController: SideDialogsController;
    urlController: UrlController;
    navigationStateController: NavigationStateController;
    collectionRegistryController: CollectionRegistryController;
};

/**
 * Hook that builds a fully-populated CMS context by combining the
 * core {@link RebaseContext} with CMS-specific controllers.
 *
 * Use this instead of `useRebaseContext()` in CMS components that
 * need to pass context to entity action callbacks, plugin slots,
 * or any consumer that expects CMS controllers on the context object.
 *
 * @group Hooks and utilities
 */
export function useCMSContext<
    USER extends User = User,
    AuthControllerType extends AuthController<USER> = AuthController<USER>
>(): CMSContext<USER, AuthControllerType> {
    const baseContext = useRebaseContext<USER, AuthControllerType>();
    const sideEntityController = useSideEntityController();
    const sideDialogsController = useSideDialogsController();
    const urlController = useUrlController();
    const navigationStateController = useNavigationStateController();
    const collectionRegistryController = useCollectionRegistryController();

    return useMemo(() => ({
        ...baseContext,
        sideEntityController,
        sideDialogsController,
        urlController,
        navigationStateController,
        collectionRegistryController
    }), [
        baseContext,
        sideEntityController,
        sideDialogsController,
        urlController,
        navigationStateController,
        collectionRegistryController
    ]);
}
