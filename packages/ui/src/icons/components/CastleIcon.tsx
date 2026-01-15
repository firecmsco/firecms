import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CastleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"castle"} ref={ref}/>
});

CastleIcon.displayName = "CastleIcon";
