import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlayLessonIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"play_lesson"} ref={ref}/>
});

PlayLessonIcon.displayName = "PlayLessonIcon";
