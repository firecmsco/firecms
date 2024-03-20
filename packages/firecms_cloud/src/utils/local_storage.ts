// const tokens = new Map<string, {
//     token: string,
//     expiry: Date
// }>();

export function cacheDelegatedLoginToken(projectId: string, delegatedToken?: string) {
    if (!delegatedToken) {
        return;
    }

    const data = parseJwt(delegatedToken);
    // @ts-ignore
    const expiry = new Date(data.exp * 1000);
    localStorage.setItem(`auth_token::${projectId}`, JSON.stringify({
        token: delegatedToken,
        expiry
    }));

}

export function getDelegatedLoginTokenFromCache(projectId: string) {
    const entry = localStorage.getItem(`auth_token::${projectId}`);
    if (entry) {
        const data = JSON.parse(entry);
        data.expiry = new Date(data.expiry);
        if (data.expiry > new Date()) {
            return data.token;
        }
    }
    return undefined;
}

export function clearDelegatedLoginTokensCache() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("auth_token::")) {
            localStorage.removeItem(key);
        }
    }
}

function parseJwt(token?: string): object {
    if (!token) {
        throw new Error("No JWT token");
    }
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(window.atob(base64).split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));

    return JSON.parse(jsonPayload);
}
