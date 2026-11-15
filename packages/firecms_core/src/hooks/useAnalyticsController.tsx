import { useContext } from "react";
import { AnalyticsController } from "../types/index.js";
import { AnalyticsContext } from "../contexts/AnalyticsContext.js";

/**
 * @group Hooks and utilities
 */
export const useAnalyticsController = (): AnalyticsController => useContext(AnalyticsContext);
