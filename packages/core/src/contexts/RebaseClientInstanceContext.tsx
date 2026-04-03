import React from "react";

/**
 * Context that exposes the full RebaseClient instance (from `@rebasepro/client`).
 * Used by the JS Editor to give developer scripts access to `client.data`, `client.auth`, etc.
 */
export const RebaseClientInstanceContext = React.createContext<any>(undefined);
