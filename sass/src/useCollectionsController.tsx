import React, { useContext } from "react";
import { CollectionsController } from "./collections_controller";
import { CollectionControllerContext } from "./CollectionControllerProvider";

export const useCollectionsController = (): CollectionsController => useContext(CollectionControllerContext);
