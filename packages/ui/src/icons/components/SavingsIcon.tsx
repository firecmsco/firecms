import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SavingsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"savings"} ref={ref}/>
});

SavingsIcon.displayName = "SavingsIcon";
