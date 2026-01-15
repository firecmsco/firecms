import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FactCheckIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fact_check"} ref={ref}/>
});

FactCheckIcon.displayName = "FactCheckIcon";
