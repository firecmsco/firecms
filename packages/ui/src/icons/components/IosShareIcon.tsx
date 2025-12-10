import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const IosShareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ios_share"} ref={ref}/>
});

IosShareIcon.displayName = "IosShareIcon";
