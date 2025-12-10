import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Diversity3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"diversity_3"} ref={ref}/>
});

Diversity3Icon.displayName = "Diversity3Icon";
