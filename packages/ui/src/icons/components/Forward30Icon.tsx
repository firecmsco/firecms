import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Forward30Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"forward_30"} ref={ref}/>
});

Forward30Icon.displayName = "Forward30Icon";
