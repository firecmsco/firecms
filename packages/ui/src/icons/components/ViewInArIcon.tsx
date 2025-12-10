import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewInArIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_in_ar"} ref={ref}/>
});

ViewInArIcon.displayName = "ViewInArIcon";
