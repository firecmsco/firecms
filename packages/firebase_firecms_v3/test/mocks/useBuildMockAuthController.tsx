import { useState } from "react";
import { FirebaseAuthController, Role } from "@firecms/firebase_firecms_v3";

import { User as FirebaseUser } from "firebase/auth";
import { createMockUser } from "./mock_user";

export function useBuildMockAuthController(): FirebaseAuthController {

    const [user, setUser] = useState<FirebaseUser | null>(null);

    return {
        authLoading: false,
        createUserWithEmailAndPassword(email: string, password: string): void {
        },
        emailPasswordLogin(email: string, password: string): void {
        },
        fetchSignInMethodsForEmail(email: string): Promise<string[]> {
            throw new Error("Function not implemented.");
        },
        googleLogin(): void {
            setUser(createMockUser())
        },
        setUser(user: FirebaseUser | null): void {
            setUser(user);
        },
        setUserRoles(roles: Role[] | null): void {
            throw new Error("Function not implemented.");
        },
        userRoles: [{ id: "admin", name: "Admin", isAdmin: true }],
        getAuthToken(): Promise<string> {
            throw new Error("Function not implemented.");
        },
        loginSkipped: false,
        signOut(): void {
            setUser(null);
        },
        user
    };
}
