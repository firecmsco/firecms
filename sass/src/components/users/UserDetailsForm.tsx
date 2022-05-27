import React, { useCallback, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
    Box,
    Button,
    Container,
    Dialog,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Typography
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

import { ColorChip, CustomDialogActions } from "@camberi/firecms";

import { SassUser } from "../../models/sass_user";
import { LoadingButton } from "@mui/lab";
import { useConfigController } from "../../useConfigController";

export const YupSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    email: Yup.string().email().required("Required"),
    roles: Yup.array().min(1)
});

export function UserDetailsForm({
                                    open,
                                    user,
                                    handleClose
                                }: {
    open: boolean,
    user?: SassUser,
    handleClose: () => void
}) {

    const { users, saveUser, roles } = useConfigController();
    const isNewUser = !Boolean(user);

    const [savingError, setSavingError] = useState<Error | undefined>();

    const onUserUpdated = useCallback((user: SassUser) => {
        setSavingError(undefined);
        return saveUser(user);
    }, [saveUser]);

    return (
        <Dialog
            open={open}
            maxWidth={"lg"}
            fullWidth
            keepMounted={false}
        >
            <Formik
                initialValues={user ?? {
                    name: "",
                    email: ""
                } as SassUser}
                validationSchema={YupSchema}
                onSubmit={(user: SassUser, formikHelpers) => {
                    return onUserUpdated(user)
                        .then(() => {
                            formikHelpers.resetForm({
                                values: user
                            });
                            handleClose();
                        })
                        .catch(e => setSavingError(e));
                }}
            >
                {({
                      isSubmitting,
                      touched,
                      values,
                      errors,
                      handleChange,
                      dirty,
                      submitCount
                  }) => {
                    return (
                        <Form noValidate style={{
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            height: "100%"
                        }}>
                            <Box sx={{
                                height: "100%",
                                flexGrow: 1
                            }}>
                                <Container maxWidth={"md"}
                                           sx={{
                                               p: 3,
                                               height: "100%",
                                               overflow: "scroll"
                                           }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            pt: 3,
                                            pb: 2
                                        }}>
                                        <Typography variant={"h4"}
                                                    sx={{ flexGrow: 1 }}>
                                            User
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2}>

                                        <Grid item xs={12}>
                                            <FormControl fullWidth
                                                         required
                                                         error={touched.name && Boolean(errors.name)}>
                                                <InputLabel
                                                    htmlFor="name">Name</InputLabel>
                                                <OutlinedInput
                                                    id="name"
                                                    value={values.name}
                                                    onChange={handleChange}
                                                    aria-describedby="name-helper-text"
                                                    label="Name"
                                                />
                                                <FormHelperText
                                                    id="name-helper-text">
                                                    {touched.name && Boolean(errors.name) ? errors.name : "Name of this user"}
                                                </FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth
                                                         required
                                                         error={touched.email && Boolean(errors.email)}>
                                                <InputLabel
                                                    htmlFor="email">Email</InputLabel>
                                                <OutlinedInput
                                                    id="email"
                                                    value={values.email}
                                                    onChange={handleChange}
                                                    aria-describedby="email-helper-text"
                                                    label="Email"
                                                />
                                                <FormHelperText
                                                    id="email-helper-text">
                                                    {touched.email && Boolean(errors.email) ? errors.email : "Email of this user"}
                                                </FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel id="roles-label">
                                                    Roles
                                                </InputLabel>
                                                <Select
                                                    labelId="roles-label"
                                                    multiple
                                                    id="roles"
                                                    name="roles"
                                                    label="Roles"
                                                    value={values.roles ?? []}
                                                    onChange={handleChange}
                                                    renderValue={(value: string[]) =>
                                                        <Box sx={theme => ({
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: theme.spacing(0.5)
                                                        })}>
                                                            {
                                                                value.map(roleId => roles.find(role => role.id === roleId))
                                                                    .filter(Boolean)
                                                                    .map(userRole =>
                                                                        <ColorChip
                                                                            label={userRole!.name}/>)}
                                                        </Box>

                                                    }
                                                >
                                                    {roles.map((value) => (
                                                        <MenuItem
                                                            key={`role-select-${value.id}`}
                                                            value={value.id}>
                                                            <ColorChip
                                                                label={value.name}/>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>


                                    </Grid>

                                    <Box height={52}/>

                                </Container>
                            </Box>
                            <CustomDialogActions
                                position={"absolute"}>
                                {savingError && <Typography sx={theme => ({
                                    color: theme.palette.error.light
                                })}>
                                    There was an error saving this user
                                </Typography>}
                                <Button variant={"text"}
                                        onClick={() => {
                                            handleClose();
                                        }}>
                                    Cancel
                                </Button>
                                <LoadingButton
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={!dirty}
                                    loading={isSubmitting}
                                    loadingPosition="start"
                                    startIcon={<SaveIcon/>}
                                >
                                    {isNewUser ? "Create user" : "Update"}
                                </LoadingButton>
                            </CustomDialogActions>
                        </Form>
                    );
                }}

            </Formik>
        </Dialog>
    );
}
