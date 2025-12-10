import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FolderSpecialIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"folder_special"} ref={ref}/>
});

FolderSpecialIcon.displayName = "FolderSpecialIcon";
