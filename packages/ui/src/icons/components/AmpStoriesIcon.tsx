import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AmpStoriesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"amp_stories"} ref={ref}/>
});

AmpStoriesIcon.displayName = "AmpStoriesIcon";
