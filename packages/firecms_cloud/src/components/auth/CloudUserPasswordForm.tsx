import { useSnackbarController } from "@firecms/core";
import { useEffect, useState } from "react";
import { ArrowBackIcon, Button, CircularProgress, IconButton, LoadingButton, TextField, Typography } from "@firecms/ui";
import { FireCMSBackend } from "../../types";

type LoginFormMode = "login" | "signup";

export function CloudUserPasswordForm({
                                          onClose,
                                          fireCMSBackend,
                                      }: {
    onClose: () => void,
    fireCMSBackend: FireCMSBackend,
}) {

    const [mode, setMode] = useState<LoginFormMode>("login");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [resettingPassword, setResettingPassword] = useState(false);

    const snackbarController = useSnackbarController();

    useEffect(() => {
        if (!document) return;
        const escFunction = (event: any) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };
        document.addEventListener("keydown", escFunction, false);
        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, [onClose]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            snackbarController.open({
                message: "Please enter both email and password",
                type: "error"
            });
            return;
        }

        if (mode === "login") {
            fireCMSBackend.emailPasswordLogin(email, password);
        } else {
            fireCMSBackend.createUserWithEmailAndPassword(email, password);
        }
    };

    const handlePasswordReset = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            snackbarController.open({
                message: "Please enter your email first",
                type: "error"
            });
            return;
        }

        setResettingPassword(true);
        try {
            await fireCMSBackend.sendPasswordResetEmail(email);
            snackbarController.open({
                message: "Password reset email sent",
                type: "success"
            });
        } catch (e: any) {
            snackbarController.open({
                message: e.message,
                type: "error"
            });
        } finally {
            setResettingPassword(false);
        }
    };

    const isFormValid = email.trim() && password.trim();

    return (
        <form className={"w-full"} onSubmit={handleSubmit}>
            <div className={"max-w-[480px] w-full flex flex-col gap-4"}>

                <div className={"w-full flex flex-row items-center gap-4"}>
                    <IconButton
                        size={"small"}
                        onClick={onClose}>
                        <ArrowBackIcon size={"small"}/>
                    </IconButton>

                    <Typography variant={"label"}>
                        {mode === "login" ? "Sign in to your account" : "Create a new account"}
                    </Typography>
                </div>

                <TextField
                    placeholder="Email"
                    autoFocus
                    value={email}
                    disabled={fireCMSBackend.loginLoading}
                    type="email"
                    size={"small"}
                    autoComplete={"username"}
                    onChange={(event) => setEmail(event.target.value)}
                />

                <TextField
                    key={mode}
                    placeholder="Password"
                    value={password}
                    disabled={fireCMSBackend.loginLoading}
                    size={"small"}
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : undefined}
                    onChange={(event) => setPassword(event.target.value)}
                />

                <div className={"flex justify-between items-center w-full gap-2"}>
                    <div className="flex gap-2 items-center">

                        {mode === "login" && (
                            <LoadingButton
                                variant="text"
                                loading={resettingPassword}
                                onClick={handlePasswordReset}>
                                Reset password
                            </LoadingButton>
                        )}
                        {fireCMSBackend.loginLoading && (
                            <CircularProgress size={"smallest"}/>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="text"
                            onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                            {mode === "login" ? "New user?" : "Have an account?"}
                        </Button>

                        <Button
                            type="submit"
                            disabled={!isFormValid || fireCMSBackend.loginLoading}>
                            {mode === "login" ? "Sign In" : "Sign Up"}
                        </Button>
                    </div>
                </div>

            </div>
        </form>
    );

}
