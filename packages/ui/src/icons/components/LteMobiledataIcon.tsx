import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LteMobiledataIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lte_mobiledata"} ref={ref}/>
});

LteMobiledataIcon.displayName = "LteMobiledataIcon";
