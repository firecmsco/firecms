import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SingleBedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"single_bed"} ref={ref}/>
});

SingleBedIcon.displayName = "SingleBedIcon";
