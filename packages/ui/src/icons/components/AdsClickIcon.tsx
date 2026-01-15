import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AdsClickIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ads_click"} ref={ref}/>
});

AdsClickIcon.displayName = "AdsClickIcon";
