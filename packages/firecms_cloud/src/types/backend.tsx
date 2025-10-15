import { OAuthCredential, User as FirebaseUser } from "@firebase/auth";
import { FirebaseApp } from "@firebase/app";
import { ProjectsApi } from "../api/projects";
import { FireCMSProject } from "./projects";

export type FireCMSBackend = {

    backendUid?: string;
    backendFirebaseApp?: FirebaseApp;
    backendApiHost: string;

    projectsApi: ProjectsApi;

    user: FirebaseUser | null;

    googleLogin: (includeGoogleAdminScopes?: boolean) => Promise<FirebaseUser | null>;

    emailPasswordLogin: (email: string, password: string) => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    createUserWithEmailAndPassword: (email: string, password: string) => Promise<void>;
    fetchSignInMethods: (email: string) => Promise<string[]>;

    signOut: () => void;

    googleCredential?: OAuthCredential | null;
    getBackendAuthToken: () => Promise<string>;

    permissionsNotGrantedError: boolean;

    availableProjectIds?: string[];
    availableProjectsLoaded: boolean;
    availableProjectsLoading: boolean;
    availableProjectsError?: Error;

    authLoading: boolean;
    authProviderError?: any;

    loginLoading: boolean;

    getProject: (projectId: string) => Promise<FireCMSProject | null>,
    projects: FireCMSProject[] | undefined;
}
