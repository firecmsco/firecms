import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TagFacesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tag_faces"} ref={ref}/>
});

TagFacesIcon.displayName = "TagFacesIcon";
