import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NewReleasesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"new_releases"} ref={ref}/>
});

NewReleasesIcon.displayName = "NewReleasesIcon";
