import React, { useCallback, useState } from "react";
import * as Realm from "realm-web";

import { AuthController } from "firecms";

interface MongoAuthControllerProps {
    app: Realm.App;
}

export type MongoAuthController = AuthController & {
    emailPasswordLogin: (email: string, password: string) => void;
    register: (email: string, password: string) => void;
}

/**
 * Use this hook to build an {@link AuthController} based on Firebase Auth
 *
 */
export const useMongoAuthController = ({
                                           app
                                       }: MongoAuthControllerProps): MongoAuthController => {

    const [authError, setAuthError] = useState<any>();
    const [authProviderError, setAuthProviderError] = useState<any>();
    const [initialLoading, setInitialLoading] = useState(false);

    const [currentUser, setCurrentUser] = React.useState(app.currentUser);

    const logOut = React.useCallback(async () => {
        try {
            const user = app.currentUser;
            if (!user)
                throw Error("User is not logged in");
            await user?.logOut();
            await app.removeUser(user);
        } catch (err) {
            console.error(err);
        }
        setCurrentUser(null);
    }, [app]);


    const getAuthToken = useCallback(async (): Promise<string> => {
        throw Error("Not implemented");
    }, []);

    const emailPasswordLogin = useCallback(async (email: string, password: string) => {
        try {
            console.log("Logging in with email and password", email);
            await app.logIn(Realm.Credentials.emailPassword(email, password));
            setCurrentUser(app.currentUser);
        } catch (err) {
            console.error(err);
            setAuthProviderError(err);
        }
    }, [app]);

    const register = useCallback(async (email: string, password: string) => {
        try {
            console.log("Registering with email and password", email);
            app.fetcher.clone({});
            await app.emailPasswordAuth.registerUser({ email, password });
            // todo: login required?
            setCurrentUser(app.currentUser);
        } catch (err) {
            console.error(err);
            setAuthProviderError(err);
        }
    }, [app.currentUser, app.emailPasswordAuth]);

    return {
        loginSkipped: false,
        user: currentUser ? {
            uid: currentUser.id,
            displayName: currentUser.profile?.name ?? null,
            email: currentUser.profile.email ?? null,
            photoURL: currentUser.profile?.pictureUrl ?? null,
            providerId: currentUser.providerType as string ?? null,
            isAnonymous: false
        } : null,
        authError,
        authProviderError,
        initialLoading,
        getAuthToken,
        signOut: logOut,
        register,
        emailPasswordLogin
    };
};
