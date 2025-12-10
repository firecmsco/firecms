import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DriveFileMoveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"drive_file_move"} ref={ref}/>
});

DriveFileMoveIcon.displayName = "DriveFileMoveIcon";
