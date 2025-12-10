import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FolderSharedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"folder_shared"} ref={ref}/>
});

FolderSharedIcon.displayName = "FolderSharedIcon";
