import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InsertDriveFileIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"insert_drive_file"} ref={ref}/>
});

InsertDriveFileIcon.displayName = "InsertDriveFileIcon";
