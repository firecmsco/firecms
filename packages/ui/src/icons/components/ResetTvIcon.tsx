import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ResetTvIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"reset_tv"} ref={ref}/>
});

ResetTvIcon.displayName = "ResetTvIcon";
