import * as React from "react";
import { Entity } from "@firecms/core";

import { Exercise } from "../exercises";
// @ts-ignore
import { firebaseConfig } from "../../firebase_config";
import { Chip, Table, TableBody } from "@firecms/ui";

export interface ExerciseTitlePreviewProps {
    entity: Entity<Exercise>;
}

/**
 * Fetch the feedback questions of an exercise and render them in a table
 */
function MediaThumbnailsUrls(
    {
        entity
    }: ExerciseTitlePreviewProps): JSX.Element {

return <></>
}


export default React.memo(MediaThumbnailsUrls);
