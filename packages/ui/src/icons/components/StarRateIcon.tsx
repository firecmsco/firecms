import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StarRateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"star_rate"} ref={ref}/>
});

StarRateIcon.displayName = "StarRateIcon";
