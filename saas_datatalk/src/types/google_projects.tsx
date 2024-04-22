export type GoogleProject = {
    name: string,
    projectId: string,
    projectNumber: string,
    displayName: string,
    fireCMSProject: boolean,
    fireCMSWebappEnabled: boolean,
    cloudProjectConfigurationStatus: GoogleProjectConfigurationStatus
};

export type GoogleProjectConfigurationStatus = {
    firebaseEnabled: boolean | "loading",
    authEnabled: boolean,
    firestoreEnabled: boolean | null | "loading",
    storageEnabled: boolean | "loading",
    apisEnabled: boolean | "loading",
}

export type GoogleProjectsConfig = {
    googleProjects?: GoogleProject[],
    projectsLoading: boolean,
    projectsLoadingError?: Error,
};
