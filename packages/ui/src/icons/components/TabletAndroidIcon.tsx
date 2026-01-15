import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TabletAndroidIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tablet_android"} ref={ref}/>
});

TabletAndroidIcon.displayName = "TabletAndroidIcon";
