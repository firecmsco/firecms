import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UploadFileIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"upload_file"} ref={ref}/>
});

UploadFileIcon.displayName = "UploadFileIcon";
