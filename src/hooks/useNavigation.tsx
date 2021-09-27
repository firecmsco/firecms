import { NavigationContext } from "../models";
import { useCMSAppContext } from "../contexts";
import {
    removeInitialAndTrailingSlashes
} from "../core/util/navigation_utils";


/**
 * Use this hook to get the navigation of the app.
 * Note that if can be undefined if the navigation has not yet been
 * resolved (you used a {@link NavigationBuilder} and the user is not
 * authenticated.
 *
 * @category Hooks and utilities
 */
export function useNavigation(): NavigationContext {

    const context = useCMSAppContext();
    const basePath = context.basePath;
    const baseCollectionPath = context.baseCollectionPath;

    const fullCollectionPath = basePath ? `/${basePath}/${baseCollectionPath}`: `/${baseCollectionPath}`;

    function isCollectionPath(path: string): boolean {
        return removeInitialAndTrailingSlashes(path).startsWith(fullCollectionPath);
    }

    function getEntityOrCollectionPath(path: string): string {
        if (path.startsWith(fullCollectionPath))
            return path.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }

    function buildEntityPath(entityId: string,
                            path: string,
                            subcollection?: string): string {
        return `${baseCollectionPath}/${removeInitialAndTrailingSlashes(path)}/${entityId}${subcollection ? "/" + subcollection : ""}`;
    }

    function buildCollectionPath(path: string): string {
        return `${baseCollectionPath}/${removeInitialAndTrailingSlashes(path)}`;
    }

    function buildNewEntityPath(path: string): string {
        return `${baseCollectionPath}/${removeInitialAndTrailingSlashes(path)}#new`;
    }

    function buildCMSURL(path: string): string {
        return basePath ? `/${basePath}/${removeInitialAndTrailingSlashes(path)}` : path;
    }

    function buildHomeUrl(): string {
        return basePath ? `/${basePath}` : "/";
    }

    return {
        navigation: context.navigation,
        isCollectionPath,
        getEntityOrCollectionPath,
        buildEntityPath,
        buildCollectionPath,
        buildNewEntityPath,
        buildCMSURL,
        buildHomeUrl
    };
}
