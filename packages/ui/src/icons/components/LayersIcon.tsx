import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LayersIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"layers"} ref={ref}/>
});

LayersIcon.displayName = "LayersIcon";
