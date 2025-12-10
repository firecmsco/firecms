import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SimCardDownloadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sim_card_download"} ref={ref}/>
});

SimCardDownloadIcon.displayName = "SimCardDownloadIcon";
