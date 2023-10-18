import { User as FirebaseUser } from "firebase/auth";
import { useEffect } from "react";
import { createMockUser } from "./mock_user";

export function useMockDelegatedLogin({ onUserChanged }: {
    onUserChanged: (user?: FirebaseUser) => void,
}) {
    useEffect(() => {
        onUserChanged(createMockUser());
    }, [onUserChanged]);

    return {
        delegatedLoginLoading: false,
        delegatedLoginError: undefined
    }

}
