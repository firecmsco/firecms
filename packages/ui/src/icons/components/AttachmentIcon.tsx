import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AttachmentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"attachment"} ref={ref}/>
});

AttachmentIcon.displayName = "AttachmentIcon";
