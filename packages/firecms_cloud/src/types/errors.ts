type ApiErrorAdditional = {
    missingPermissions?: string[];
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
