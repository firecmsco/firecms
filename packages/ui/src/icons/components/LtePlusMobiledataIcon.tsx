import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LtePlusMobiledataIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lte_plus_mobiledata"} ref={ref}/>
});

LtePlusMobiledataIcon.displayName = "LtePlusMobiledataIcon";
