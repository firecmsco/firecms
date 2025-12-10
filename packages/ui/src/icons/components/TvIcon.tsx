import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TvIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tv"} ref={ref}/>
});

TvIcon.displayName = "TvIcon";
