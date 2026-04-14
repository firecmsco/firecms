// import { useState } from "react";
//
// import { OAuthCredential, User as FirebaseUser } from "@firebase/auth";
// import { FirebaseApp } from "@firebase/app";
// import { MOCK_PROJECT_ID } from "./constants";
// import { createMockUser } from "./mock_user";
// import { RebaseBackend, RebaseProject, ProjectsApi } from "@rebasepro/cloud";
//
// export function useBuildMockRebaseBackend(): RebaseBackend {
//
//     const [loggedUser, setLoggedUser] = useState<FirebaseUserWrapper | null>();
//
//     const signOut = () => setLoggedUser(null);
//     const googleLogin = () => setLoggedUser(createMockUser());
//
//     const getBackendAuthToken = async () => "MOCK_TOKEN";
//     const googleCredential = OAuthCredential.fromJSON({});
//
//     const availableProjects = [MOCK_PROJECT_ID];
//
//     const backendFirebaseApp: FirebaseApp = {
//         name: "",
//         options: {},
//         automaticDataCollectionEnabled: false
//     };
//
//     const notImplemented = function (): Promise<any> {
//         throw new Error("Function not implemented.");
//     };
//
//     const projectsApi: ProjectsApi = {
//         createNewRebaseProject: notImplemented,
//         createFirebaseWebapp: notImplemented,
//         addSecurityRules: notImplemented,
//         createServiceAccount: notImplemented,
//         createNewUser: notImplemented,
//         updateUser: notImplemented,
//         deleteUser: notImplemented,
//         getRootCollections: notImplemented,
//         doDelegatedLogin: notImplemented,
//         getStripePortalLink: notImplemented,
//         getRemoteConfigUrl: notImplemented,
//     }
//
//     return {
//         getProject(projectId: string): Promise<RebaseProject | null> {
//             throw new Error("Method not implemented.");
//         },
//         projects: undefined,
//         backendApiHost: "https://mock.url",
//         user: loggedUser ?? null,
//         signOut,
//         googleLogin,
//         getBackendAuthToken,
//         googleCredential,
//         availableProjectIds: availableProjects,
//         availableProjectsLoaded: true,
//         availableProjectsLoading: false,
//         availableProjectsError: undefined,
//         permissionsNotGrantedError: false,
//         authLoading: false,
//         backendFirebaseApp,
//         backendUid: loggedUser?.uid,
//         projectsApi
//     }
//
// }
//
