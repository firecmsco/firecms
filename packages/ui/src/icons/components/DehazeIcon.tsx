import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DehazeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dehaze"} ref={ref}/>
});

DehazeIcon.displayName = "DehazeIcon";
