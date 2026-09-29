import { getCurrentUserEmail, getValidTokens } from "./auth.js";
import { getBackendIdToken } from "./backend-auth.js";
import { FireCMSSession } from "./session.js";

/**
 * The session of the local server: whoever signed in on this machine with
 * `firecms_login`, from the tokens the FireCMS CLI keeps in `~/.firecms/tokens.json`.
 */
export const localSession: FireCMSSession = {
    email: async () => getCurrentUserEmail() ?? undefined,
    backendIdToken: () => getBackendIdToken(),
    googleAccessToken: async () => (await getValidTokens())?.access_token,
};
