import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TrendingNeutralIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"trending_neutral"} ref={ref}/>
});

TrendingNeutralIcon.displayName = "TrendingNeutralIcon";
