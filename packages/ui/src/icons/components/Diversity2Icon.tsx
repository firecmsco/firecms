import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Diversity2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"diversity_2"} ref={ref}/>
});

Diversity2Icon.displayName = "Diversity2Icon";
