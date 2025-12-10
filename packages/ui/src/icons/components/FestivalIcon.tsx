import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FestivalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"festival"} ref={ref}/>
});

FestivalIcon.displayName = "FestivalIcon";
