import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MergeTypeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"merge_type"} ref={ref}/>
});

MergeTypeIcon.displayName = "MergeTypeIcon";
