import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Man2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"man_2"} ref={ref}/>
});

Man2Icon.displayName = "Man2Icon";
