import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Crop75Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crop_7_5"} ref={ref}/>
});

Crop75Icon.displayName = "Crop75Icon";
