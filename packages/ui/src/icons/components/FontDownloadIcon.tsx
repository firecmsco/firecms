import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FontDownloadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"font_download"} ref={ref}/>
});

FontDownloadIcon.displayName = "FontDownloadIcon";
