import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TransitEnterexitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"transit_enterexit"} ref={ref}/>
});

TransitEnterexitIcon.displayName = "TransitEnterexitIcon";
