/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useCallback, useState } from "react";

import { useValidateAuthenticator } from "../src/hooks/useValidateAuthenticator";

const userA = { uid: "user-a" } as any;
const userB = { uid: "user-b" } as any;

/**
 * Minimal auth controller, modelled after `useFirebaseAuthController`:
 * it returns a brand new object on every render, and signing out clears the
 * logged user through React state, which triggers a re-render.
 */
function useTestAuthController() {
    const [user, setUser] = useState<any>(null);
    const signOut = useCallback(() => setUser(null), []);
    return {
        user,
        setUser,
        signOut,
        initialLoading: false,
        loginSkipped: false,
        authLoading: false
    } as any;
}

/**
 * Note: the authenticators used here must be plain functions declared in this
 * file, since the hook checks `authenticator instanceof Function` and jest mock
 * functions belong to a different realm than the jsdom test globals.
 */
function renderValidateAuthenticator(authenticator: any) {
    return renderHook(() => {
        const authController = useTestAuthController();
        const validation = useValidateAuthenticator({
            authController,
            authenticator,
            dataSourceDelegate: {} as any,
            storageSource: {} as any
        });
        return {
            authController,
            ...validation
        };
    });
}

/**
 * Flush the pending promises of the authenticator, plus the re-renders they
 * cascade into, like the sign out performed on a rejected user.
 */
async function flush() {
    for (let i = 0; i < 5; i++) {
        await act(async () => {
            await Promise.resolve();
        });
    }
}

describe("useValidateAuthenticator", () => {

    it("allows a user accepted by the authenticator", async () => {
        const { result } = renderValidateAuthenticator(async () => true);

        await act(async () => {
            result.current.authController.setUser(userA);
        });
        await flush();

        expect(result.current.notAllowedError).toBe(false);
        expect(result.current.canAccessMainView).toBe(true);
    });

    it("rejects a user denied by the authenticator, and keeps the error while on the login screen", async () => {
        const { result } = renderValidateAuthenticator(async () => false);

        await act(async () => {
            result.current.authController.setUser(userA);
        });
        await flush();

        // the rejected user is signed out, and the error is exposed so the login
        // view can display it
        expect(result.current.authController.user).toBeNull();
        expect(result.current.notAllowedError).toBeTruthy();
        expect(result.current.canAccessMainView).toBe(false);

        // further re-renders must not wipe the error, otherwise the login view
        // would never get the chance to show it
        await flush();
        expect(result.current.notAllowedError).toBeTruthy();
    });

    it("clears the error when an allowed user logs in after a rejected one", async () => {
        const { result } = renderValidateAuthenticator(async ({ user }: any) => user.uid === userB.uid);

        // user A is not allowed
        await act(async () => {
            result.current.authController.setUser(userA);
        });
        await flush();

        expect(result.current.notAllowedError).toBeTruthy();
        expect(result.current.canAccessMainView).toBe(false);

        // user B is allowed, so the stale error must not lock them out
        await act(async () => {
            result.current.authController.setUser(userB);
        });
        await flush();

        expect(result.current.notAllowedError).toBe(false);
        expect(result.current.canAccessMainView).toBe(true);
        expect(result.current.authLoading).toBe(false);
        expect(result.current.authVerified).toBe(true);
    });

    it("clears an error thrown by the authenticator when an allowed user logs in", async () => {
        const error = new Error("Not allowed");
        const { result } = renderValidateAuthenticator(async ({ user }: any) => {
            if (user.uid === userA.uid)
                throw error;
            return true;
        });

        await act(async () => {
            result.current.authController.setUser(userA);
        });
        await flush();

        expect(result.current.notAllowedError).toBe(error);
        expect(result.current.canAccessMainView).toBe(false);

        await act(async () => {
            result.current.authController.setUser(userB);
        });
        await flush();

        expect(result.current.notAllowedError).toBe(false);
        expect(result.current.canAccessMainView).toBe(true);
    });

    it("does not keep validating the same user once it has been checked", async () => {
        let calls = 0;
        const { result, rerender } = renderValidateAuthenticator(async () => {
            calls++;
            return true;
        });

        await act(async () => {
            result.current.authController.setUser(userA);
        });
        await flush();

        const callsAfterLogin = calls;

        rerender();
        await flush();

        expect(calls).toBe(callsAfterLogin);
        expect(result.current.canAccessMainView).toBe(true);
    });

});
