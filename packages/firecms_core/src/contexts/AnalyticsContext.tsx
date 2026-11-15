import React from "react";
import { AnalyticsController } from "../types/index.js";

export const AnalyticsContext = React.createContext<AnalyticsController>({} as AnalyticsController);
