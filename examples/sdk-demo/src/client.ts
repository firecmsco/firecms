import { createRebaseClient } from "@rebasepro/client-rebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const client = createRebaseClient({
  baseUrl: API_URL,
});
