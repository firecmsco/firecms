import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MuseumIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"museum"} ref={ref}/>
});

MuseumIcon.displayName = "MuseumIcon";
