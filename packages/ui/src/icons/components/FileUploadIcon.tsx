import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FileUploadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"file_upload"} ref={ref}/>
});

FileUploadIcon.displayName = "FileUploadIcon";
