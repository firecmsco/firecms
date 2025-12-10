import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _8kIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"8k"} ref={ref}/>
});

_8kIcon.displayName = "_8kIcon";
