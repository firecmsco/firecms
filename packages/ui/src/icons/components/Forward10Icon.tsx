import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Forward10Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"forward_10"} ref={ref}/>
});

Forward10Icon.displayName = "Forward10Icon";
