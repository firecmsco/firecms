import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FontDownloadOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"font_download_off"} ref={ref}/>
});

FontDownloadOffIcon.displayName = "FontDownloadOffIcon";
