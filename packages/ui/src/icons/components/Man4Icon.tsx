import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Man4Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"man_4"} ref={ref}/>
});

Man4Icon.displayName = "Man4Icon";
