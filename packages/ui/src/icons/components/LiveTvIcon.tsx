import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LiveTvIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"live_tv"} ref={ref}/>
});

LiveTvIcon.displayName = "LiveTvIcon";
