import { useContext } from "react";
import { RebaseClientInstanceContext } from "../contexts/RebaseClientInstanceContext";

/**
 * Hook to retrieve the full RebaseClient instance from context.
 * Returns `undefined` if no client was provided to `<Rebase>`.
 */
export function useRebaseClient<T = any>(): T | undefined {
    return useContext(RebaseClientInstanceContext) as T | undefined;
}
