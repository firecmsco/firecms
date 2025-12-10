import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContentPasteSearchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"content_paste_search"} ref={ref}/>
});

ContentPasteSearchIcon.displayName = "ContentPasteSearchIcon";
