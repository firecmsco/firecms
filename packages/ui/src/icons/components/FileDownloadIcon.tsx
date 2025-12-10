import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FileDownloadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"file_download"} ref={ref}/>
});

FileDownloadIcon.displayName = "FileDownloadIcon";
