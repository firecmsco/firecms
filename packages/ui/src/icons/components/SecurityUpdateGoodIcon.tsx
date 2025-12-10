import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SecurityUpdateGoodIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"security_update_good"} ref={ref}/>
});

SecurityUpdateGoodIcon.displayName = "SecurityUpdateGoodIcon";
