import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoPhotographyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_photography"} ref={ref}/>
});

NoPhotographyIcon.displayName = "NoPhotographyIcon";
