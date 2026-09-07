type ApiErrorAdditional = {
    missingPermissions?: string[];
    errorDetails?: object;
    /**
     * Why a delegated service account was rejected, when the backend could tell.
     * See `DelegatedCredentialFailureReason` in the backend.
     */
    reason?: string;
    /** The service account the backend tried to use, for display. */
    clientEmail?: string;
};

export class ApiError extends Error {

    public code?: string;
    public projectId?: string;
    public data?: ApiErrorAdditional;

    constructor(message: string, code?: string, projectId?: string, data?: ApiErrorAdditional) {
        super(message);
        this.code = code;
        this.projectId = projectId;
        this.data = data;
    }
}
