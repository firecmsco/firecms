import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DriveFolderUploadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"drive_folder_upload"} ref={ref}/>
});

DriveFolderUploadIcon.displayName = "DriveFolderUploadIcon";
