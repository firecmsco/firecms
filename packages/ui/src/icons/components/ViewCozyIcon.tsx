import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewCozyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_cozy"} ref={ref}/>
});

ViewCozyIcon.displayName = "ViewCozyIcon";
