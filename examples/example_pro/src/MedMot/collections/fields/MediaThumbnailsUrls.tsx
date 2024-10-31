import * as React from "react";
import { Entity } from "@firecms/core";

import { Exercise } from "../exercises";
// @ts-ignore
import path from "path-browserify";
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

    if (entity.values.image == null)
        return <p>No image</p>

    const extension = path.extname(entity.values.image);
    const dirname = path.dirname(entity.values.image);
    const fileName = path.basename(entity.values.image, extension);
//400x400,1400x1200,700x600,1280x720,800x465,1200x1200
    const thumbnailsSizes = [
        "400x400",
        "1400x1200",
        "700x600",
        "1280x720",
        "800x465",
        "1200x1200"
    ];

    const baseUrl = `https://storage.googleapis.com/${process.env.NODE_ENV !== "production" ? firebaseConfig.storageBucket : "medicalmotion-df799.appspot.com"}/`

    //now create the urls from the thumbanilsizes
    const urls = thumbnailsSizes.map(size => {
        return { size: size, url: `${baseUrl}${dirname}/thumbnails/${fileName}_${size}${extension}` }
    })

    //url of the original image
    const originalUrl = `${baseUrl}${dirname}/${fileName}${extension}`

    return <Table>
        <TableBody>
            <div>Click to copy</div>
            <Chip onClick={() => {
                navigator.clipboard.writeText(originalUrl).then(function () {
                    alert("Copied to clipboard")
                }, function (err) {
                    alert('Async: Could not copy text: ' + err);
                })
            }} style={{ marginRight: 3, marginBottom: 3 }}>
                Original
            </Chip>
            {urls != null && urls.map((image1, index) => {

                    return (<Chip onClick={() => {
                            navigator.clipboard.writeText(image1.url).then(function () {
                                alert("Copied to clipboard")
                            }, function (err) {
                                alert('Async: Could not copy text: ' + err);
                            })
                        }} style={{ marginRight: 3, marginBottom: 3 }} key={index}>
                            {image1.size}
                        </Chip>
                    )
                }
            )}
        </TableBody>
    </Table>

}


export default React.memo(MediaThumbnailsUrls);
