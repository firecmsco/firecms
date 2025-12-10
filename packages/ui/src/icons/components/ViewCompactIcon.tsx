import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewCompactIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_compact"} ref={ref}/>
});

ViewCompactIcon.displayName = "ViewCompactIcon";
