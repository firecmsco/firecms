import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CelebrationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"celebration"} ref={ref}/>
});

CelebrationIcon.displayName = "CelebrationIcon";
