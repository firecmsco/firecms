import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ClearAllIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"clear_all"} ref={ref}/>
});

ClearAllIcon.displayName = "ClearAllIcon";
