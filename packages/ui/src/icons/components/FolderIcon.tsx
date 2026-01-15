import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FolderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"folder"} ref={ref}/>
});

FolderIcon.displayName = "FolderIcon";
