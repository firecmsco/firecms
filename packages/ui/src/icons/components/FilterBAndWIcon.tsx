import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilterBAndWIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_b_and_w"} ref={ref}/>
});

FilterBAndWIcon.displayName = "FilterBAndWIcon";
