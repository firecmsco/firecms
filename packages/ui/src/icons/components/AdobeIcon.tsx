import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AdobeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"adobe"} ref={ref}/>
});

AdobeIcon.displayName = "AdobeIcon";
