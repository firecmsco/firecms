import React, { useContext } from "react";
import { ConfigController } from "./config_controller";
import { ConfigControllerContext } from "./ConfigControllerProvider";

export const useCollectionsController = (): ConfigController => useContext(ConfigControllerContext);
