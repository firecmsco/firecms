import { paperMixin } from "../styles";
import { cn } from "./util/cn";

export function Paper({
                          children,
                          style,
                          className,
                      }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;

}) {
    return (
        <div
            className={cn(paperMixin, className)}
            style={style}>
            {children}
        </div>
    )
}
