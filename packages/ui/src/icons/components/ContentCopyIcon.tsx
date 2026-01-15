import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContentCopyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"content_copy"} ref={ref}/>
});

ContentCopyIcon.displayName = "ContentCopyIcon";
