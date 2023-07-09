export function InfoLabel({
                              children,
                              mode = "info"
                          }: {
    children: React.ReactNode,
    mode?: "info" | "warn"
}) {

    return (
        <div
            className="my-3 py-1 px-2 rounded bg-[your_background_value]">
            {children}
        </div>
    )
}
