import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewQuiltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_quilt"} ref={ref}/>
});

ViewQuiltIcon.displayName = "ViewQuiltIcon";
