import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Brightness2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brightness_2"} ref={ref}/>
});

Brightness2Icon.displayName = "Brightness2Icon";
