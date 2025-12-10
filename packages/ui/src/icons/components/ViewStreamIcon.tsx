import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewStreamIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_stream"} ref={ref}/>
});

ViewStreamIcon.displayName = "ViewStreamIcon";
