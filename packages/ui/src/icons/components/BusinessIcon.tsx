import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BusinessIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"business"} ref={ref}/>
});

BusinessIcon.displayName = "BusinessIcon";
