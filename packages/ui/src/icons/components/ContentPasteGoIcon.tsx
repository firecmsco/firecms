import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContentPasteGoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"content_paste_go"} ref={ref}/>
});

ContentPasteGoIcon.displayName = "ContentPasteGoIcon";
