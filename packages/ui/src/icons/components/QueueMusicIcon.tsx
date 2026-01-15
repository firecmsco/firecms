import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QueueMusicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"queue_music"} ref={ref}/>
});

QueueMusicIcon.displayName = "QueueMusicIcon";
