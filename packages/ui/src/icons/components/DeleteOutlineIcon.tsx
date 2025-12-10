import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeleteOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"delete_outline"} ref={ref}/>
});

DeleteOutlineIcon.displayName = "DeleteOutlineIcon";
