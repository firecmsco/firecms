import { pink, red } from "@mui/material/colors";
import { createTheme, Theme } from "@mui/material";

/**
 * Use this function to build the default FireCMS MUI5 theme,
 * with some overrides.
 * @category Hooks and utilities
 */
export const createCMSDefaultTheme = (
    { mode, primaryColor, secondaryColor, fontFamily }: {
        mode: "light" | "dark";
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
    }): Theme => {

    const original = createTheme({
        palette: {
            mode: mode,
            background: {
                default: mode === "dark" ? "#424242" : "#f6f8f9"
            },
            primary: {
                main: primaryColor ? primaryColor : "#0070f4"
            },
            secondary: {
                main: secondaryColor ? secondaryColor : pink["400"]
            },
            error: {
                main: red.A400
            }
        },
        typography: {
            "fontFamily": fontFamily ? fontFamily : `"Rubik", "Roboto", "Helvetica", "Arial", sans-serif`,
            fontWeightMedium: 500,
            h6: {
                fontWeight: 500,
                fontSize: "1.15rem"
            }
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 4
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
                            fontFamily: "'Space Mono', 'Lucida Console', monospace"
                        },
                        "&.weight-500": {
                            fontWeight: 500
                        }
                    }
                }
            },
            // MuiInputLabel: {
            //     styleOverrides: {
            //         root: {
            //             marginTop: "4px",
            //         },
            //         filled: {
            //             marginTop: "4px",
            //         }
            //     }
            // },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        "&.mono": {
                            fontFamily: "'Space Mono', 'Lucida Console', monospace"
                        }
                    }
                }
            },
        //     MuiFormControlLabel: {
        //         styleOverrides: {
        //             label: {
        //                 width: "100%"
        //             }
        //         }
        //     }
        }
    });

    return {
        ...original
        // shadows: original.shadows.map((value, index) => {
        //     if (index == 1) return "0 1px 1px 0 rgb(0 0 0 / 16%)";
        //     else return value;
        // })
    };
};
