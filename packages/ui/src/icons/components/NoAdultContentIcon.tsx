import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoAdultContentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_adult_content"} ref={ref}/>
});

NoAdultContentIcon.displayName = "NoAdultContentIcon";
