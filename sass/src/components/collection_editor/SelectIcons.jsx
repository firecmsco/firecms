import * as React from "react";
import { styled } from "@mui/material/styles";
import MuiPaper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import { debounce } from "@mui/material/utils";
import IconButton from "@mui/material/IconButton";
import { Index as FlexSearchIndex } from "flexsearch";
import SearchIcon from "@mui/icons-material/Search";
import SvgIcon from "@mui/material/SvgIcon";
import * as mui from "@mui/icons-material";
import synonyms from "./synonyms";

const UPDATE_SEARCH_INDEX_WAIT_MS = 220;

if (process.env.NODE_ENV !== "production") {
    Object.keys(synonyms).forEach((icon) => {
        if (!mui[icon]) {
            console.warn(`The icon ${icon} no longer exists. Remove it from \`synonyms\``);
        }
    });
}

function selectNode(node) {
    // Clear any current selection
    const selection = window.getSelection();
    selection.removeAllRanges();

    // Select code
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.addRange(range);
}

const StyledIcon = styled("span")(({ theme }) => ({
    display: "inline-flex",
    flexDirection: "column",
    color: theme.palette.text.secondary,
    margin: "0 4px",
    "& > div": {
        display: "flex",
    },
    "& > div > *": {
        flexGrow: 1,
        fontSize: ".6rem",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center",
        width: 0,
    },
}));

const StyledSvgIcon = styled(SvgIcon)(({ theme }) => ({
    boxSizing: "content-box",
    cursor: "pointer",
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius,
    transition: theme.transitions.create(["background-color", "box-shadow"], {
        duration: theme.transitions.duration.shortest,
    }),
    padding: theme.spacing(2),
    margin: theme.spacing(0.5, 0),
    "&:hover": {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
    },
}));

const Icons = React.memo(function Icons(props) {
    const {
        icons,
        handleOpenClick
    } = props;

    const handleIconClick = (icon) => () => {

    };

    const handleLabelClick = (event) => {
        selectNode(event.currentTarget);
    };

    return (
        <div>
            {icons.map((icon) => {
                /* eslint-disable jsx-a11y/click-events-have-key-events */
                return (
                    <StyledIcon key={icon.importName}
                                onClick={handleIconClick(icon)}>
                        <StyledSvgIcon
                            component={icon.Component}
                            fontSize="large"
                            tabIndex={-1}
                            onClick={handleOpenClick}
                            title={icon.importName}
                        />
                        <div>
                            {/*  eslint-disable-next-line jsx-a11y/no-static-element-interactions -- TODO: a11y */}
                            <div
                                onClick={handleLabelClick}>{icon.importName}</div>
                        </div>
                        {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
                    </StyledIcon>
                );
            })}
        </div>
    );
});


const Paper = styled(MuiPaper)(({ theme }) => ({
    position: "sticky",
    top: 16,
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    width: "100%",
}));

function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(value);
}

const Input = styled(InputBase)({
    marginLeft: 8,
    flex: 1,
});

const searchIndex = new FlexSearchIndex({
    tokenize: "full",
});

const allIconsMap = {};
const allIcons = Object.keys(mui)
    .sort()
    .map((importName) => {
        let theme;
        if (importName.indexOf("Outlined") !== -1) {
            theme = "Outlined";
        } else if (importName.indexOf("TwoTone") !== -1) {
            theme = "Two tone";
        } else if (importName.indexOf("Rounded") !== -1) {
            theme = "Rounded";
        } else if (importName.indexOf("Sharp") !== -1) {
            theme = "Sharp";
        } else {
            theme = "Filled";
        }

        const name = importName.replace(/(Outlined|TwoTone|Rounded|Sharp)$/, "");
        let searchable = name;
        if (synonyms[searchable]) {
            searchable += ` ${synonyms[searchable]}`;
        }
        searchIndex.addAsync(importName, searchable);

        const icon = {
            importName,
            name,
            theme,
            Component: mui[importName],
        };
        allIconsMap[importName] = icon;
        return icon;
    });


export function SearchIcons({selectedIcon = "", onIconSelected}
                                // :{ selectedIcon: string, onIconSelected: (icon:string) => void}
) {
    const theme = "Filled"
    const [keys, setKeys] = React.useState(null);
    const [query, setQuery] = React.useState("");

    const handleOpenClick = React.useCallback(
        (event) => {
            onIconSelected(event.currentTarget.getAttribute("title"));
        },
        [onIconSelected],
    );

    const updateSearchResults = React.useMemo(
        () =>
            debounce((value) => {
                if (value === "") {
                    setKeys(null);
                } else {
                    searchIndex.searchAsync(value).then((results) => {
                        setKeys(results);
                    });
                }
            }, UPDATE_SEARCH_INDEX_WAIT_MS),
        [],
    );

    React.useEffect(() => {
        updateSearchResults(query);
        return () => {
            updateSearchResults.clear();
        };
    }, [query, updateSearchResults]);

    const icons = React.useMemo(
        () =>
            (keys === null ? allIcons : keys.map((key) => allIconsMap[key])).filter(
                (icon) => theme === icon.theme,
            ),
        [theme, keys],
    );


    return (
        <Container>
                <Paper>
                    <IconButton sx={{ padding: "10px" }} aria-label="search">
                        <SearchIcon/>
                    </IconButton>
                    <Input
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search icons…"
                        inputProps={{ "aria-label": "search icons" }}
                    />
                </Paper>
                <Typography sx={{ mb: 1 }}>{`${formatNumber(
                    icons.length,
                )} matching results`}</Typography>
                <Icons icons={icons} handleOpenClick={handleOpenClick}/>
        </Container>
    );
}
