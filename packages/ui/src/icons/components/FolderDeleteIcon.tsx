import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FolderDeleteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"folder_delete"} ref={ref}/>
});

FolderDeleteIcon.displayName = "FolderDeleteIcon";
