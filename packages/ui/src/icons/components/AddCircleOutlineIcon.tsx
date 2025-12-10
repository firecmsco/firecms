import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddCircleOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_circle_outline"} ref={ref}/>
});

AddCircleOutlineIcon.displayName = "AddCircleOutlineIcon";
