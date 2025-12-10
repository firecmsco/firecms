import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TrendingFlatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"trending_flat"} ref={ref}/>
});

TrendingFlatIcon.displayName = "TrendingFlatIcon";
