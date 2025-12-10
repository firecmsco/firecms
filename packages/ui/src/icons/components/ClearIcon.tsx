import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ClearIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"clear"} ref={ref}/>
});

ClearIcon.displayName = "ClearIcon";
