import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotAccessibleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"not_accessible"} ref={ref}/>
});

NotAccessibleIcon.displayName = "NotAccessibleIcon";
