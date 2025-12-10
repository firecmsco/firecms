import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirtyLensIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dirty_lens"} ref={ref}/>
});

DirtyLensIcon.displayName = "DirtyLensIcon";
