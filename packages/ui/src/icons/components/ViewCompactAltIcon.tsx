import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewCompactAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_compact_alt"} ref={ref}/>
});

ViewCompactAltIcon.displayName = "ViewCompactAltIcon";
