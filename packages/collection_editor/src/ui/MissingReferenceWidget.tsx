import { Button, ErrorView, unslugify, useNavigationController } from "@firecms/core";
import { useCollectionEditorController } from "../useCollectionEditorController";

export function MissingReferenceWidget({ path: pathProp }: {
    path: string
}) {
    const navigation = useNavigationController();
    const path = getLastSegment(pathProp);
    const parentCollectionIds = navigation.getParentCollectionIds(pathProp);
    const collectionEditor = useCollectionEditorController();
    return <div className={"p-1 flex flex-col items-center"}>
        <ErrorView error={"No collection for path: " + path}/>
        <Button className={"mx-2"} variant={"outlined"} size={"small"}
                onClick={() => {
                    collectionEditor.createCollection({
                        initialValues: { path, name: unslugify(path) },
                        parentCollectionIds,
                        redirect: false
                    });
                }}>
            Create
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
