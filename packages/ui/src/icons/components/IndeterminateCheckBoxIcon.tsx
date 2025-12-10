import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const IndeterminateCheckBoxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"indeterminate_check_box"} ref={ref}/>
});

IndeterminateCheckBoxIcon.displayName = "IndeterminateCheckBoxIcon";
