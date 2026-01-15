import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MovieCreationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"movie_creation"} ref={ref}/>
});

MovieCreationIcon.displayName = "MovieCreationIcon";
