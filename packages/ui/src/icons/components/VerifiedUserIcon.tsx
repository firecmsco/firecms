import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VerifiedUserIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"verified_user"} ref={ref}/>
});

VerifiedUserIcon.displayName = "VerifiedUserIcon";
