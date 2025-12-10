import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Diversity1Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"diversity_1"} ref={ref}/>
});

Diversity1Icon.displayName = "Diversity1Icon";
