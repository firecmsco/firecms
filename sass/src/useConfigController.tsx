import React, { useContext } from "react";
import { ConfigController } from "./models/config_controller";
import { ConfigControllerContext } from "./ConfigControllerProvider";

export const useConfigController = (): ConfigController => useContext(ConfigControllerContext);
