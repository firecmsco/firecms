import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FileDownloadDoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"file_download_done"} ref={ref}/>
});

FileDownloadDoneIcon.displayName = "FileDownloadDoneIcon";
