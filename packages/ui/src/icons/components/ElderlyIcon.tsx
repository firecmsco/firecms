import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ElderlyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"elderly"} ref={ref}/>
});

ElderlyIcon.displayName = "ElderlyIcon";
