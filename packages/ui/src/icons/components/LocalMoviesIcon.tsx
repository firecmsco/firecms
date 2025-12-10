import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalMoviesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_movies"} ref={ref}/>
});

LocalMoviesIcon.displayName = "LocalMoviesIcon";
