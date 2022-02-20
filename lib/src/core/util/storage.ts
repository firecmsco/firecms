import {
    EntityValues,
    ResolvedArrayProperty,
    ResolvedStringProperty,
    StorageConfig,
    UploadedFileContext
} from "../../models";

export function resolveFilename<M>(input: string | ((context: UploadedFileContext) => string),
                                   storage: StorageConfig,
                                   values: EntityValues<M>,
                                   entityId: string,
                                   path: string,
                                   property: ResolvedStringProperty | ResolvedArrayProperty<string[]>,
                                   file: File,
                                   propertyId: string): string {
    if (typeof input === "function") {
        return input({
            entityId,
            values,
            property,
            file,
            storage,
            propertyId
        });
    } else {
        const ext = file.name.split(".").pop();
        let res = input.replace("{entityId}", entityId)
            .replace("{propertyId}", propertyId)
            .replace("{file}", file.name)
            .replace("{path}", path);
        if (ext) {
            res = res.replace("{file.ext}", ext);
            const name = file.name.replace(`.${ext}`, "");
            res = res.replace("{file.name}", name)
        }
        return res;
    }
}
