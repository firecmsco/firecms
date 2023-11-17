import { useContext } from "react";
import { CollectionsConfigController } from "./types/config_controller";
import { ConfigControllerContext } from "./ConfigControllerProvider";

/**
 * Use this hook to access the configuration controller.
 * You can use it to get the list of collections, and to save/delete collections.
 */
export const useCollectionsConfigController = (): CollectionsConfigController => useContext(ConfigControllerContext);
