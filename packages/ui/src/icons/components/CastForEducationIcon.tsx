import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CastForEducationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cast_for_education"} ref={ref}/>
});

CastForEducationIcon.displayName = "CastForEducationIcon";
