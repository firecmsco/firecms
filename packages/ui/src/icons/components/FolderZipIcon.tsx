import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FolderZipIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"folder_zip"} ref={ref}/>
});

FolderZipIcon.displayName = "FolderZipIcon";
