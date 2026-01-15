import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RadioIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"radio"} ref={ref}/>
});

RadioIcon.displayName = "RadioIcon";
