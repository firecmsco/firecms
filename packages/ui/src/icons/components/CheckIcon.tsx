import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CheckIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"check"} ref={ref}/>
});

CheckIcon.displayName = "CheckIcon";
