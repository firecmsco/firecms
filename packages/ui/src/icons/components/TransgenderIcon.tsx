import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TransgenderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"transgender"} ref={ref}/>
});

TransgenderIcon.displayName = "TransgenderIcon";
