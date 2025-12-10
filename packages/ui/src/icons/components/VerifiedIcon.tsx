import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VerifiedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"verified"} ref={ref}/>
});

VerifiedIcon.displayName = "VerifiedIcon";
