import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FolderOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"folder_off"} ref={ref}/>
});

FolderOffIcon.displayName = "FolderOffIcon";
