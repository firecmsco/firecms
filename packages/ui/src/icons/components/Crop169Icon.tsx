import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Crop169Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crop_16_9"} ref={ref}/>
});

Crop169Icon.displayName = "Crop169Icon";
