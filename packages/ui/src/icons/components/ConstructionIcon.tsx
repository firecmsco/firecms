import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ConstructionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"construction"} ref={ref}/>
});

ConstructionIcon.displayName = "ConstructionIcon";
