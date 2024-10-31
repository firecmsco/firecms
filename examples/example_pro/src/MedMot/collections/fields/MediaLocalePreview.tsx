import * as React from "react";
import { useEffect, useState } from "react";
import { Entity } from "@firecms/core";
import {
    collection,
    getDocs,
    getFirestore,
    QuerySnapshot
} from "firebase/firestore";

import {
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@firecms/ui";
import { Exercise } from "../exercises";

export interface ExerciseTitlePreviewProps {
    entity: Entity<Exercise>;
}

/**
 * Fetch the feedback questions of an exercise and render them in a table
 */
function MediaLocalePreview(
    {
        entity
    }: ExerciseTitlePreviewProps): JSX.Element {

    const [loading, setLoading] = useState<boolean>(true);
    const [result, setResult] = useState<TranslationEntry[]>([]);

    useEffect(() => {
        let unmounted = false;

        const firestore = getFirestore();
        getDocs(collection(firestore, entity.path, entity.id, "locales") )
            .then((snapshot: QuerySnapshot) => {
                if (!unmounted) {
                    setLoading(false);
                    setResult(snapshot.docs.map(doc => ({
                        language: doc.id,
                        text: doc.get("image")
                    })));
                }
            })
            .catch(error => {
                setLoading(false);
                console.error(error);
            })
        return () => {
            unmounted = true;
        };
    }, [entity.id]);

    if (loading)
        return <CircularProgress />;

    return <Table>
        <TableBody>
            {result &&
            result.map((key, index) => {
                return (
                    <TableRow
                        key={`translations_preview_table_${entity.id}_${index}`}>
                        {/*<TableCell key={`table-cell-title-${key}`}*/}
                        {/*           component="th">*/}
                        {/*    <Typography variant={"caption"}*/}
                        {/*                color={"textSecondary"}>*/}
                        {/*        {key.language}*/}
                        {/*    </Typography>*/}
                        {/*</TableCell>*/}
                        <TableCell key={`table-cell-${key}`}>
                            {key.language}
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    </Table>

}

interface TranslationEntry {
    language: string;
    text: string
}

export default React.memo(MediaLocalePreview);
