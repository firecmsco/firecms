import React, { useState } from "react";
import { Box, IconButton } from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

function ImagePreview({ small, url }: { small: boolean, url: string }) {

    const [onHover, setOnHover] = useState(false);

    return (
        <Box
            key={"image_preview_" + url}
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
                position: "relative"
            }}

            onMouseEnter={() => setOnHover(true)}
            onMouseMove={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}
            width={small ? 100 : 200}
            height={small ? 100 : 200}>
            <img src={url}
                 style={{
                     maxWidth: small ? 100 : 200,
                     maxHeight: small ? 100 : 200
                 }}/>

            {onHover && (
                <a style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4
                }}
                   href={url}
                   target="_blank"
                   onClick={(e) => e.stopPropagation()}
                >
                    <IconButton size={"small"}
                                style={{ backgroundColor: "white" }}>
                        <OpenInNewIcon fontSize={"small"}/>
                    </IconButton>
                </a>
            )}
        </Box>

    );
}

export default ImagePreview;
