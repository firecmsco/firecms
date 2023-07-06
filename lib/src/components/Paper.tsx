import clsx from "clsx";
import { paperMixin } from "../styles";

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
            className={clsx(paperMixin, className)}
            style={style}>
            {children}
        </div>
    )
}
