export type ContainerProps = {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}

export function Container({
                              children,
                              className,
                              style,
                          }: ContainerProps) {

    return (
        <div
            className={`container mx-auto px-4 ${className}`}
            style={style}>
            {children}
        </div>
    );
}
