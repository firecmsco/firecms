import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GraphicEqIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"graphic_eq"} ref={ref}/>
});

GraphicEqIcon.displayName = "GraphicEqIcon";
