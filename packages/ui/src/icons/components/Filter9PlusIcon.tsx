import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Filter9PlusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_9_plus"} ref={ref}/>
});

Filter9PlusIcon.displayName = "Filter9PlusIcon";
