import React from "react";
import { AnalyticsController } from "../types";

export const AnalyticsContext = React.createContext<AnalyticsController>({} as AnalyticsController);
