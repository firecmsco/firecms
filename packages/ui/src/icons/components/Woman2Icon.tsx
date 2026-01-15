import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Woman2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"woman_2"} ref={ref}/>
});

Woman2Icon.displayName = "Woman2Icon";
