import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Forward5Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"forward_5"} ref={ref}/>
});

Forward5Icon.displayName = "Forward5Icon";
