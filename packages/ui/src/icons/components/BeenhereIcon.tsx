import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BeenhereIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"beenhere"} ref={ref}/>
});

BeenhereIcon.displayName = "BeenhereIcon";
