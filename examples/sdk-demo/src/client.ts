import { createRebaseClient } from "@rebasepro/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const client = createRebaseClient({
  baseUrl: `${API_URL}/api`,
  websocketUrl: `ws://localhost:3001`,
});
