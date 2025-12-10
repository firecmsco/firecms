import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BedroomBabyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bedroom_baby"} ref={ref}/>
});

BedroomBabyIcon.displayName = "BedroomBabyIcon";
