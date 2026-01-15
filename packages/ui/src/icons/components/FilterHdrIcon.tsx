import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilterHdrIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_hdr"} ref={ref}/>
});

FilterHdrIcon.displayName = "FilterHdrIcon";
