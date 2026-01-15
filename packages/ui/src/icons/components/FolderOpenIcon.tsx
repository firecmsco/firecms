import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FolderOpenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"folder_open"} ref={ref}/>
});

FolderOpenIcon.displayName = "FolderOpenIcon";
