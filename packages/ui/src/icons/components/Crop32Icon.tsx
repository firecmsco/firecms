import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Crop32Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crop_3_2"} ref={ref}/>
});

Crop32Icon.displayName = "Crop32Icon";
