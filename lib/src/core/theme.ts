import { pink, red } from "@mui/material/colors";
import { createTheme, Theme } from "@mui/material";
import type {} from "@mui/lab/themeAugmentation";

declare module "@mui/material/styles" {
    interface TypographyVariants {
        label: React.CSSProperties;
    }

    interface TypographyVariantsOptions {
        label?: React.CSSProperties;
    }
}

declare module "@mui/material/Typography" {
    interface TypographyPropsVariantOverrides {
        label: true;
    }
}

/**
 * Use this function to build the default FireCMS MUI5 theme,
 * with some overrides.
 * @category Hooks and utilities
 */
export const createCMSDefaultTheme = (
    { mode, primaryColor, secondaryColor, fontFamily, headersFontFamily }: {
        mode: "light" | "dark";
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
        headersFontFamily?: string;
    }): Theme => {

    const radius = 6;

    const { palette } = createTheme();
    const { augmentColor } = palette;
    const createColor = (mainColor: string) => augmentColor({ color: { main: mainColor } });

    const original = createTheme({
        palette: {
            mode,
            background: {
                default: mode === "dark" ? "#202024" : "#f8f8fa",
                paper: mode === "dark" ? "#121215" : "#ffffff"
            },
            primary: {
                main: primaryColor || "#0070f4"
            },
            secondary: {
                main: secondaryColor || pink["400"]
            },
            error: {
                main: red.A400
            }
        },
        shape: {
            borderRadius: radius
        },
        typography: {
            fontFamily: fontFamily || "'Rubik', 'Roboto', 'Helvetica', 'Arial', sans-serif",
            fontWeightMedium: 500,
            h6: {
                fontFamily: fontFamily || "'Rubik', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                fontSize: "1.15rem",
                fontWeight: 500
            },
            h5: {
                fontFamily: fontFamily || "'Rubik', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                fontSize: "1.55rem"
            },
            h4: {
                fontFamily: fontFamily || "'Rubik', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                fontSize: "2rem",
                fontWeight: 500
            },
            h3: {
                fontFamily: fontFamily || "'Rubik', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                fontWeight: 600
            },
            h2: {
                fontFamily: headersFontFamily || "'IBM Plex Mono', 'Space Mono', 'Rubik', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                fontWeight: 600
            },
            h1: {
                fontFamily: headersFontFamily || "'IBM Plex Mono', 'Space Mono', 'Rubik', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                fontWeight: 600
            },
            label: {
                display: "block",
                color: "#838383",
                fontWeight: 500,
                fontSize: "0.875rem",
                lineHeight: 1.43
            }
        },
        components: {
            MuiSkeleton: {
                styleOverrides: {
                    root: {
                        borderRadius: radius
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: radius
                    }
                }
            },
            MuiLoadingButton: {
                styleOverrides: {
                    root: {
                        borderRadius: radius
                    }
                }
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        "&:last-child td": {
                            borderBottom: 0
                        }
                    }
                }
            },
            MuiTypography: {
                styleOverrides: {
                    root: {
                        "&.mono": {
                            fontFamily: "'IBM Plex Mono', 'Space Mono', monospace, 'Lucida Console'"
                        },
                        "&.weight-500": {
                            fontWeight: 500
                        }
                    }
                }
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        "&.mono": {
                            fontFamily: "'IBM Plex Mono', 'Space Mono', 'Lucida Console', monospace"
                        },
                        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                            display: "none"
                        },
                        "& input[type=number]": {
                            MozAppearance: "textfield"
                        }
                    }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundImage: "inherit",
                    }
                }
            },
            // MuiPaper: {
            //     styleOverrides: {
            //         outlined: {
            //             border: "none",
            //         }
            //     }
            // },
            MuiCardActionArea: {
                styleOverrides: {
                    root: {
                        borderRadius: radius
                    }
                }
            }
        }
    });

    return {
        ...original,
        // @ts-ignore
        shadows: original.shadows.map((shadow, index) => {
            if (index === 3) {
                return "0px 0px 0px 0px rgba(0,0,0,0.18), 0px 0px 10px 0px rgba(0,0,0,0.12), 0px 0px 14px 2px rgba(0,0,0,0.10)"
            }
            return shadow;
        })
    };
};
