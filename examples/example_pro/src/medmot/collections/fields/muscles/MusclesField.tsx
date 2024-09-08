// import React, { useState } from "react";
// import { FieldProps } from "@firecms/core";
// import {
//     getAllAncestorIds,
//     getMuscle,
//     leafMuscles,
//     musclesTree
// } from "./muscles";
// import {
//     Button,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     Paper,
//     TextField,
//     Typography
// } from "@firecms/ui";
//
//
// export interface Muscle {
//     id: number;
//     name: string;
//     code: string;
//     children?: Muscle[];
// }
//
// const useStyles = {
//     root: "max-h-[500px] flex-grow overflow-auto",
//     largePadding: "p-2",
//     regularPadding: "p-1"
// };
//
//
// export default function MusclesField({
//                                          propertyKey,
//                                          showError,
//                                          error,
//                                          property,
//                                          isSubmitting,
//                                          value,
//                                          touched,
//                                          setValue
//                                      }: FieldProps<number>) {
//
//
//     const [open, setOpen] = useState<boolean>(false);
//
//     if (error) {
//         console.log("touched", touched);
//         console.log("errors", propertyKey, showError, error);
//     }
//
//     const classes = useStyles();
//
//     let defaultExpanded: string[];
//     if (value) {
//         defaultExpanded = getAllAncestorIds(value).map(n => n.toString());
//     } else {
//         defaultExpanded = ["3"];
//     }
//
//     const renderTree = (muscle: Muscle) => (
//         <TreeItem
//             key={muscle.id}
//             nodeId={muscle.id.toString()}
//             onClick={(event: any) => {
//                 if (!muscle.children) {
//                     setValue(muscle.id);
//                 }
//             }}
//             label={
//                 !muscle.children && defaultExpanded.includes(muscle.id.toString())
//                     ? <b>{muscle.name}</b>
//                     : muscle.name}>
//             {Array.isArray(muscle.children) ? muscle.children.map(node => renderTree(node)) : null}
//         </TreeItem>
//     );
//
//     const onClose = () => setOpen(false);
//     const onOpen = () => setOpen(true);
//
//     return (
//
//         <FormControl
//             required={property.validation?.required}
//             error={showError}
//             disabled={isSubmitting}
//             fullWidth>
//
//             <Typography variant={"caption"}>
//                 {property.name}
//             </Typography>
//             <Paper
//                 variant={"outlined"}
//                 className={classes.largePadding}
//             >
//                 <Grid>
//                     <Box display="flex">
//                         <Box flexGrow={1}>
//                             <Autocomplete
//                                 id={`muscles-field-${propertyKey}`}
//                                 options={leafMuscles}
//                                 value={value ? getMuscle(value) : undefined}
//                                 onChange={(event: any, newValue: Muscle | null) => {
//                                     setValue(newValue ? newValue.id : null);
//
//                                 }}
//                                 getOptionLabel={(option: Muscle) => option.name}
//                                 renderInput={(params) => <TextField {...params}
//                                                                     variant="standard"/>}
//                             />
//                         </Box>
//                         {/*<Box flexGrow={1}>*/}
//                         {/*    <b>{!!value ? getMuscle(value).name : "No muscle set"}</b>*/}
//                         {/*</Box>*/}
//                         <Box
//                             className={classes.regularPadding}>
//                             <Button onClick={onOpen} color="primary">
//                                 Browse
//                             </Button>
//                         </Box>
//                     </Box>
//
//
//                     <Dialog
//                         disableEscapeKeyDown
//                         maxWidth="md"
//                         keepMounted
//                         aria-labelledby="muscles-dialog-title"
//                         open={open}
//                         onBackdropClick={onClose}
//                     >
//                         <DialogTitle id="confirmation-dialog-title">
//                             Select a muscle
//                         </DialogTitle>
//
//                         <DialogContent dividers>
//                             <TreeView
//                                 key={defaultExpanded.join("-")}
//                                 className={classes.root}
//                                 defaultCollapseIcon={<ExpandMoreIcon/>}
//                                 defaultExpanded={defaultExpanded}
//                                 multiSelect={false}
//                                 selected={value ? value.toString() : undefined}
//                                 defaultExpandIcon={<ChevronRightIcon/>}
//                             >
//                                 {renderTree(musclesTree)}
//                             </TreeView>
//                         </DialogContent>
//
//                         <DialogActions>
//                             <Button onClick={onClose} color="primary">
//                                 Ok
//                             </Button>
//                         </DialogActions>
//
//                     </Dialog>
//                 </Grid>
//             </Paper>
//
//             {showError && <FormHelperText
//                 id="component-error-text">{error}</FormHelperText>}
//
//             {property.description &&
//             <FormHelperText>{property.description}</FormHelperText>}
//
//         </FormControl>
//
//
//     );
//
// }
//
//
//
