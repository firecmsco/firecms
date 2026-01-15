import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DisabledVisibleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"disabled_visible"} ref={ref}/>
});

DisabledVisibleIcon.displayName = "DisabledVisibleIcon";
