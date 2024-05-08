import { IdTokenResult } from "@firebase/auth";

export function createMockUser() {
    return {
        emailVerified: false,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: "",
        tenantId: null,
        delete: function (): Promise<void> {
            throw new Error("Function not implemented.");
        },
        getIdToken: function (forceRefresh?: boolean | undefined): Promise<string> {
            throw new Error("Function not implemented.");
        },
        getIdTokenResult: function (forceRefresh?: boolean | undefined): Promise<IdTokenResult> {
            throw new Error("Function not implemented.");
        },
        reload: function (): Promise<void> {
            throw new Error("Function not implemented.");
        },
        toJSON: function (): object {
            throw new Error("Function not implemented.");
        },
        displayName: "Mock user",
        email: "mock@user.com",
        phoneNumber: null,
        photoURL: null,
        providerId: "",
        uid: "mock_uid"
    };
}
