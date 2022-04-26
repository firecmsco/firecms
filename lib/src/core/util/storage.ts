import {
    EntityValues,
    ResolvedArrayProperty,
    ResolvedStringProperty,
    StorageConfig,
    UploadedFileContext
} from "../../models";

export function resolveStorageString<M>(input: string | ((context: UploadedFileContext) => string),
                                        storage: StorageConfig,
                                        values: EntityValues<M>,
                                        entityId: string,
                                        path: string,
                                        property: ResolvedStringProperty | ResolvedArrayProperty<string[]>,
                                        file: File,
                                        propertyKey: string): string {
    if (typeof input === "function") {
        return input({
            entityId,
            values,
            property,
            file,
            storage,
            propertyKey
        });
    } else {
        const ext = file.name.split(".").pop();
        let res = input.replace("{entityId}", entityId)
            .replace("{propertyKey}", propertyKey)
            .replace("{file}", file.name)
            .replace("{file.type}", file.type)
            .replace("{path}", path);
        if (ext) {
            res = res.replace("{file.ext}", ext);
            const name = file.name.replace(`.${ext}`, "");
            res = res.replace("{file.name}", name)
        }
        return res;
    }
}
