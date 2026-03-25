import React from "react";
import {
    Typography,
    Button,
    IconButton,
    Paper,
    Container,
    Separator,
    cls,
    DeleteIcon
} from "@rebasepro/ui";

export const UIStyleGuide = () => {
    const typographyVariants = [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "subtitle1", "subtitle2",
        "body1", "body2",
        "caption", "label", "button"
    ] as const;

    const colors = ["primary", "secondary", "disabled", "error"] as const;
    const buttonVariants = ["filled", "outlined", "text"] as const;
    const buttonColors = ["primary", "secondary", "text", "error", "neutral"] as const;
    const buttonSizes = ["small", "medium", "large", "xl", "2xl"] as const;

    const IconExample = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
    );

    return (
        <Container className="py-10 max-w-5xl">
            <Typography variant="h2" gutterBottom>Rebase UI Style Guide</Typography>
            <Typography variant="body1" color="secondary" className="mb-8">
                A showcase of all typography and button variants available in the @rebasepro/ui library.
            </Typography>

            <section className="mb-12">
                <Typography variant="h4" gutterBottom className="border-b pb-2 mb-6">Typography Variants</Typography>
                <Paper className="p-6 space-y-6">
                    {typographyVariants.map(variant => (
                        <div key={variant} className="flex items-center gap-4 border-b border-surface-100 dark:border-surface-800 pb-4 last:border-0">
                            <span className="w-24 text-[10px] uppercase tracking-wider text-text-disabled font-mono">{variant}</span>
                            <Typography variant={variant}>
                                The quick brown fox jumps over the lazy dog ({variant})
                            </Typography>
                        </div>
                    ))}
                </Paper>
            </section>

            <section className="mb-12">
                <Typography variant="h4" gutterBottom className="border-b pb-2 mb-6">Typography Colors</Typography>
                <Paper className="p-6 space-y-4">
                    {colors.map(color => (
                        <div key={color} className="flex items-center gap-4">
                            <span className="w-24 text-[10px] uppercase tracking-wider text-text-disabled font-mono">{color}</span>
                            <Typography color={color}>
                                This text is rendered with color="{color}"
                            </Typography>
                        </div>
                    ))}
                </Paper>
            </section>

            <section className="mb-12">
                <Typography variant="h4" gutterBottom className="border-b pb-2 mb-6">Button Discovery</Typography>

                <div className="space-y-8">
                    {buttonVariants.map(variant => (
                        <div key={variant}>
                            <Typography variant="h6" gutterBottom className="capitalize mb-4">{variant} Buttons</Typography>
                            <Paper className="p-6">
                                <div className="flex flex-wrap gap-4">
                                    {buttonColors.map(color => (
                                        <div key={color} className="flex flex-col items-center gap-2">
                                            <Button variant={variant} color={color}>
                                                {color}
                                            </Button>
                                            <span className="text-[10px] text-text-disabled font-mono">{color}</span>
                                        </div>
                                    ))}
                                    <div className="flex flex-col items-center gap-2">
                                        <Button variant={variant} color="primary" disabled>
                                            Disabled
                                        </Button>
                                        <span className="text-[10px] text-text-disabled font-mono">disabled</span>
                                    </div>
                                </div>
                            </Paper>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-12">
                <Typography variant="h4" gutterBottom className="border-b pb-2 mb-6">Button Sizes</Typography>
                <Paper className="p-6">
                    <div className="flex flex-wrap items-end gap-6 text-center">
                        {buttonSizes.map(size => (
                            <div key={size} className="flex flex-col items-center gap-4">
                                <Button size={size} color="primary">
                                    {size}
                                </Button>
                                <span className="text-[10px] text-text-disabled font-mono">{size}</span>
                            </div>
                        ))}
                    </div>
                </Paper>
            </section>

            <section className="mb-12">
                <Typography variant="h4" gutterBottom className="border-b pb-2 mb-6">Icon Buttons</Typography>
                <Paper className="p-6">
                    <div className="flex flex-wrap gap-8 items-center">
                        <div className="flex flex-col items-center gap-2">
                            <IconButton color="primary">
                                <IconExample />
                            </IconButton>
                            <span className="text-[10px] text-text-disabled font-mono">primary</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <IconButton color="secondary">
                                <IconExample />
                            </IconButton>
                            <span className="text-[10px] text-text-disabled font-mono">secondary</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <IconButton size="small">
                                <IconExample />
                            </IconButton>
                            <span className="text-[10px] text-text-disabled font-mono">small</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <IconButton disabled>
                                <IconExample />
                            </IconButton>
                            <span className="text-[10px] text-text-disabled font-mono">disabled</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <IconButton size="small" color="error">
                                <DeleteIcon />
                            </IconButton>
                            <span className="text-[10px] text-text-disabled font-mono">delete</span>
                        </div>
                    </div>
                </Paper>
            </section>

            <section className="mb-12">
                <div className="flex justify-between items-center bg-surface-100 dark:bg-surface-800 p-8 rounded-xl border border-dashed border-surface-400">
                    <div>
                        <Typography variant="h5">Dark Mode Check</Typography>
                        <Typography variant="body2" color="secondary">Typography and buttons should adapt automatically.</Typography>
                    </div>
                    <Button variant="outlined" startIcon={<IconExample />}>
                        Sample Action
                    </Button>
                </div>
            </section>
        </Container>
    );
};
