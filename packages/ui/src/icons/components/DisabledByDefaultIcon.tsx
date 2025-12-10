import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DisabledByDefaultIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"disabled_by_default"} ref={ref}/>
});

DisabledByDefaultIcon.displayName = "DisabledByDefaultIcon";
