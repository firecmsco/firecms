import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HPlusMobiledataIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"h_plus_mobiledata"} ref={ref}/>
});

HPlusMobiledataIcon.displayName = "HPlusMobiledataIcon";
