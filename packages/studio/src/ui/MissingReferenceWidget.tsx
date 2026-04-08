import {
    ErrorView,
    useCollectionRegistryController,
    useTranslation
} from "@rebasepro/core";
import { prettifyIdentifier } from "@rebasepro/common";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { Button } from "@rebasepro/ui";

export function MissingReferenceWidget({ path: pathProp }: {
    path: string
}) {
    const registry = useCollectionRegistryController();
    const path = getLastSegment(pathProp);
    const parentCollectionIds = registry.getParentCollectionIds(pathProp);
    const collectionEditor = useCollectionEditorController();
    const { t } = useTranslation();
    return <div className={"p-1 flex flex-col items-center"}>
        <ErrorView error={t("studio_missing_reference_error", { path })} />
        <Button className={"mx-2"}
            size={"small"}
            onClick={() => {
                collectionEditor.createCollection({
                    initialValues: { path, name: prettifyIdentifier(path) },
                    parentCollectionIds,
                    redirect: false,
                    sourceClick: "missing_reference"
                });
            }}>
            {t("studio_missing_reference_create")}
        </Button>
    </div>;
}

function getParentPathSegments(path: string): string[] {
    const segments = path.split("/");
    return segments.filter((segment, index) => index % 2 === 0 && index !== segments.length - 1);
}

function getLastSegment(path: string): string {
    const segments = path.split("/");
    return segments[segments.length - 1];
}
