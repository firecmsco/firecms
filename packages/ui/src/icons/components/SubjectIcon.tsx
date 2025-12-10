import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SubjectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"subject"} ref={ref}/>
});

SubjectIcon.displayName = "SubjectIcon";
