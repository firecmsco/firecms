import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TempleBuddhistIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"temple_buddhist"} ref={ref}/>
});

TempleBuddhistIcon.displayName = "TempleBuddhistIcon";
