import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MergeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"merge"} ref={ref}/>
});

MergeIcon.displayName = "MergeIcon";
