import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DriveFileRenameOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"drive_file_rename_outline"} ref={ref}/>
});

DriveFileRenameOutlineIcon.displayName = "DriveFileRenameOutlineIcon";
