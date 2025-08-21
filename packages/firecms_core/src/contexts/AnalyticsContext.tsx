import React from "react";
import { AnalyticsController } from "@firecms/types";

export const AnalyticsContext = React.createContext<AnalyticsController>({} as AnalyticsController);
