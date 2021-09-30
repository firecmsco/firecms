import { ModeStateContext } from "../core/contexts/ModeState";
import { useContext } from "react";

/**
 * @category Hooks and utilities
 */
export interface ModeState {
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
    toggleMode: () => void;
}

/**
 * Hook to retrieve the current mode ("light" | "dark"), and `setMode`
 * or `toggle` functions to change it.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see ModeState
 * @category Hooks and utilities
 */
export const useModeState = () => useContext(ModeStateContext);
