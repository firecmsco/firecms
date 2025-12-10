import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoAwesomeMosaicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_awesome_mosaic"} ref={ref}/>
});

AutoAwesomeMosaicIcon.displayName = "AutoAwesomeMosaicIcon";
