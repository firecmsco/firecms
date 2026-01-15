import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _3dRotationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"3d_rotation"} ref={ref}/>
});

_3dRotationIcon.displayName = "_3dRotationIcon";
