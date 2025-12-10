import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RecommendIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"recommend"} ref={ref}/>
});

RecommendIcon.displayName = "RecommendIcon";
