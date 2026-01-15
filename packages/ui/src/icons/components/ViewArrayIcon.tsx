import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewArrayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_array"} ref={ref}/>
});

ViewArrayIcon.displayName = "ViewArrayIcon";
