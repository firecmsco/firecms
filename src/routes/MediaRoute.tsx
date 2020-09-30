import React, { useState } from "react";
import { RouteComponentProps } from "react-router";
import { formStyles } from "../styles";
import {
    Button,
    createStyles,
    Grid,
    makeStyles,
    Paper,
    Theme
} from "@material-ui/core";
import { storage } from "firebase/app";

import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { uploadFile } from "../firebase";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tree: {
            height: 216,
            flexGrow: 1,
            maxWidth: 400
        }
    })
);

interface MediaRouteProps {
}

interface Node {
    full_path: string;
    name: string;
    children: Node[],
    ref: storage.Reference
}

function StorageTree() {

    const classes = useStyles();
    let st = storage();

    let initialState: Node = {
        full_path: "",
        name: "Root",
        children: [],
        ref: st.ref()
    };

    const [treeArray, setTreeArray] = useState<Record<string, Node>>({ "": initialState });

    const onNodeToggle = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {

    };
    const onNodeToggle2 = (nodeId: string, expanded: boolean) => {
        let reference = st.ref(nodeId);
        if (expanded) {
            reference.list().then((listResult) => {
                const newTreeArray = { ...treeArray };
                listResult.prefixes.forEach((prefix) => {
                    const newNode = {
                        full_path: prefix.fullPath,
                        children: [],
                        ref: prefix,
                        name: prefix.name
                    };
                    newTreeArray[nodeId].children.push(newNode);
                    newTreeArray[prefix.fullPath] = newNode;
                });
                setTreeArray(newTreeArray);
            });
        } else {
            const newTreeArray = { ...treeArray };
            newTreeArray[nodeId].children = [];
            setTreeArray(newTreeArray);
        }
    };

    function getTreeItem(node: Node) {
        return <TreeItem nodeId={node.full_path} label={node.name}>
            {node.children.map((childNode) => getTreeItem(childNode))}
        </TreeItem>;
    }

    return (<TreeView
        className={classes.tree}
        defaultCollapseIcon={<ExpandMoreIcon/>}
        defaultExpandIcon={<ChevronRightIcon/>}
        onNodeToggle={onNodeToggle}
    >
        {getTreeItem(treeArray[""])}
    </TreeView>);
}

export function MediaRoute({ ...props }: MediaRouteProps & Partial<RouteComponentProps>) {
    const classes = formStyles();

    const [files, setFiles] = useState<File[]>([]);

    function handleChange(changedFiles: File[]) {
        setFiles(changedFiles);
        console.log(changedFiles);
        console.log(typeof changedFiles[0]);
    }

    function upload() {
        uploadFile(files[0]);
    }

    return (
        <React.Fragment>
            <Grid container spacing={2}>

                <Grid item xs={12} sm={3}>
                    <Paper elevation={0} className={classes.paper}>
                        <StorageTree/>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={9}>
                    {/*<DropzoneArea*/}
                    {/*    dropzoneText={""}*/}
                    {/*    onChange={handleChange}*/}
                    {/*    maxFileSize={20 * 1024 * 1024}*/}
                    {/*    filesLimit={10}*/}
                    {/*/>*/}

                    <Button disabled={!files.length}
                            onClick={upload}>Upload</Button>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}
