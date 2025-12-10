import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FileDownloadOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"file_download_off"} ref={ref}/>
});

FileDownloadOffIcon.displayName = "FileDownloadOffIcon";
