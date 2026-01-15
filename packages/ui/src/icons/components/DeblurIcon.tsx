import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeblurIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"deblur"} ref={ref}/>
});

DeblurIcon.displayName = "DeblurIcon";
