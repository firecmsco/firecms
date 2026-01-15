import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Man3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"man_3"} ref={ref}/>
});

Man3Icon.displayName = "Man3Icon";
