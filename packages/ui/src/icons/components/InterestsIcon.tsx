import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InterestsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"interests"} ref={ref}/>
});

InterestsIcon.displayName = "InterestsIcon";
