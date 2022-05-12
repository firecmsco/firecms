import React, { useContext } from "react";
import { ConfigController } from "./config_controller";
import { CollectionControllerContext } from "./CollectionControllerProvider";

export const useCollectionsController = (): ConfigController => useContext(CollectionControllerContext);
