import { useContext } from "react";
import { AnalyticsController } from "../types";
import { AnalyticsContext } from "../contexts/AnalyticsContext";

/**
 * @group Hooks and utilities
 */
export const useAnalyticsController = (): AnalyticsController => useContext(AnalyticsContext);
